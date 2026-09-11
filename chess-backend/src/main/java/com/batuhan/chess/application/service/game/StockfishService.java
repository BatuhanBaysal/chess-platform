package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.exception.StockfishEngineException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
public class StockfishService {

    private Process process;
    private BufferedReader reader;
    private OutputStreamWriter writer;

    private final ReentrantLock engineLock = new ReentrantLock();
    private final Map<String, CachedEvaluation> evaluationCache = new ConcurrentHashMap<>();
    private static final long THROTTLE_INTERVAL_MS = 250;

    private volatile File cachedEngineBinary;
    private volatile long lastRestartAttempt = 0;
    private static final long RESTART_COOLDOWN_MS = 10_000;

    private final ExecutorService engineExecutor = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "Stockfish-Worker");
        t.setDaemon(true);
        return t;
    });

    private static class CachedEvaluation {
        int score;
        long timestamp;

        CachedEvaluation(int score, long timestamp) {
            this.score = score;
            this.timestamp = timestamp;
        }
    }

    @PostConstruct
    public void init() {
        engineExecutor.submit(() -> {
            try {
                startEngine();
                log.info("Stockfish engine successfully pre-warmed during application startup.");
            } catch (Exception e) {
                log.error("Failed to pre-warm Stockfish engine on startup: {}", e.getMessage(), e);
            }
        });
    }

    public void startEngine() {
        engineLock.lock();
        try {
            if (process != null && process.isAlive()) {
                return;
            }

            restartEngineUnsafe();
            String engineResourcePath = resolveEngineResourcePath();
            File tempEngineFile = extractEngineToTemp(engineResourcePath);

            this.process = startProcess(tempEngineFile);
            initializeProcessStreams(this.process);
            log.info("Stockfish engine successfully started using binary: {}", engineResourcePath);

        } catch (IOException e) {
            log.error("Failed to start Stockfish engine: {}", e.getMessage(), e);
            restartEngineUnsafe();
            throw new StockfishEngineException("Failed to start Stockfish engine", e);
        } finally {
            engineLock.unlock();
        }
    }

    private String resolveEngineResourcePath() {
        String osName = System.getProperty("os.name").toLowerCase();
        if (osName.contains("win")) {
            return "engine/stockfish.exe";
        }

        String osArch = System.getProperty("os.arch").toLowerCase();
        if (osArch.contains("aarch64") || osArch.contains("arm64")) {
            return "engine/stockfish-arm64";
        }

        return "engine/stockfish";
    }

    private void initializeProcessStreams(Process activeProcess) throws IOException {
        this.reader = new BufferedReader(new InputStreamReader(activeProcess.getInputStream()));
        this.writer = new OutputStreamWriter(activeProcess.getOutputStream());

        sendCommandInternal("uci");
        sendCommandInternal("isready");

        String line;
        while ((line = reader.readLine()) != null) {
            if (line.equals("readyok")) {
                break;
            }
        }
    }

    private File extractEngineToTemp(String resourcePath) {
        if (cachedEngineBinary != null && cachedEngineBinary.exists() && cachedEngineBinary.canExecute()) {
            return cachedEngineBinary;
        }

        try {
            Path appDir = Path.of(System.getProperty("user.dir"), "engine-runtime");
            Path targetDir = Files.createDirectories(appDir);

            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            String fileName = isWindows ? "stockfish.exe" : "stockfish";
            File targetFile = targetDir.resolve(fileName).toFile();

            if (targetFile.exists() && targetFile.length() > 0) {
                ensureExecutable(targetFile, isWindows);
                cachedEngineBinary = targetFile;
                return targetFile;
            }

            try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
                if (inputStream == null) {
                    throw new FileNotFoundException("Stockfish binary not found in resources path: " + resourcePath);
                }
                Files.copy(inputStream, targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }

            ensureExecutable(targetFile, isWindows);
            cachedEngineBinary = targetFile;
            return targetFile;
        } catch (IOException e) {
            throw new StockfishEngineException("Failed to extract Stockfish binary to runtime directory: " + e.getMessage(), e);
        }
    }

    private void ensureExecutable(File file, boolean isWindows) throws IOException {
        boolean isExecutableSet = file.setExecutable(true);
        if (!isWindows && !isExecutableSet && !file.canExecute()) {
            throw new IOException("Failed to set execution permission for Stockfish binary: " + file.getAbsolutePath());
        }
    }

    public CompletableFuture<String> getBestMoveAsync(List<String> moveHistory, int depth) {
        return CompletableFuture.supplyAsync(() -> getBestMove(moveHistory, depth), engineExecutor);
    }

    public String getBestMove(List<String> moveHistory, int depth) {
        engineLock.lock();
        try {
            String positionCmd = buildPositionCommand(moveHistory);
            String output = sendAndReadUntilBestMove(positionCmd, depth);

            for (String line : output.split("\n")) {
                if (line.startsWith("bestmove")) {
                    String[] parts = line.split(" ");
                    return parts.length > 1 ? parts[1] : null;
                }
            }
        } catch (IOException e) {
            log.error("Error communicating with Stockfish for bestmove: {}", e.getMessage(), e);
            restartEngineUnsafe();
        } finally {
            engineLock.unlock();
        }
        return null;
    }

    public CompletableFuture<Integer> getEvaluationAsync(List<String> moveHistory, int depth) {
        return CompletableFuture.supplyAsync(() -> getEvaluation(moveHistory, depth), engineExecutor);
    }

    public int getEvaluation(List<String> moveHistory, int depth) {
        String cacheKey = (moveHistory == null || moveHistory.isEmpty()) ? "startpos" : String.join(",", moveHistory);
        long now = System.currentTimeMillis();

        CachedEvaluation cached = evaluationCache.get(cacheKey);
        if (cached != null && (now - cached.timestamp) < THROTTLE_INTERVAL_MS) {
            return cached.score;
        }

        engineLock.lock();
        try {
            String positionCmd = buildPositionCommand(moveHistory);
            String output = sendAndReadUntilBestMove(positionCmd, depth);

            int currentScore = 0;
            for (String line : output.split("\n")) {
                if (line.contains("score cp")) {
                    currentScore = parseCentipawnScore(line);
                } else if (line.contains("score mate")) {
                    currentScore = parseMateScore(line);
                }
            }

            evaluationCache.put(cacheKey, new CachedEvaluation(currentScore, now));
            return currentScore;
        } catch (IOException e) {
            log.error("Error getting evaluation from Stockfish: {}", e.getMessage(), e);
            restartEngineUnsafe();
        } finally {
            engineLock.unlock();
        }
        return cached != null ? cached.score : 0;
    }

    private void ensureEngineRunning() throws IOException {
        if (process == null || !process.isAlive()) {
            long now = System.currentTimeMillis();
            if (now - lastRestartAttempt < RESTART_COOLDOWN_MS) {
                throw new IOException("Engine restart on cooldown, skipping");
            }
            lastRestartAttempt = now;
            startEngineInternal();
        }
    }

    private void startEngineInternal() throws IOException {
        String engineResourcePath = resolveEngineResourcePath();
        File tempEngineFile = extractEngineToTemp(engineResourcePath);

        this.process = startProcess(tempEngineFile);
        initializeProcessStreams(this.process);
    }

    private Process startProcess(File tempEngineFile) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(tempEngineFile.getAbsolutePath());
        builder.redirectErrorStream(true);
        Process activeProcess = builder.start();

        activeProcess.onExit().thenAccept(p ->
            log.error("Stockfish process terminated unexpectedly, exitCode={}", p.exitValue())
        );

        return activeProcess;
    }

    private String buildPositionCommand(List<String> moveHistory) {
        String positionCmd = "position startpos";
        if (moveHistory != null && !moveHistory.isEmpty()) {
            positionCmd += " moves " + String.join(" ", moveHistory);
        }
        return positionCmd;
    }

    private void sendCommandInternal(String command) throws IOException {
        if (writer != null) {
            writer.write(command + "\n");
            writer.flush();
        }
    }

    private int parseCentipawnScore(String line) {
        String[] parts = line.split(" ");
        for (int i = 0; i < parts.length; i++) {
            if ("cp".equals(parts[i]) && i + 1 < parts.length) {
                try {
                    return Integer.parseInt(parts[i + 1]);
                } catch (NumberFormatException e) {
                    log.debug("Failed to parse centipawn score value '{}': {}", parts[i + 1], e.getMessage());
                }
            }
        }
        return 0;
    }

    private int parseMateScore(String line) {
        String[] parts = line.split(" ");
        for (int i = 0; i < parts.length; i++) {
            if ("mate".equals(parts[i]) && i + 1 < parts.length) {
                try {
                    int mateIn = Integer.parseInt(parts[i + 1]);
                    return mateIn > 0 ? 10000 - (mateIn * 100) : -10000 - (mateIn * 100);
                } catch (NumberFormatException e) {
                    log.debug("Failed to parse mate score value '{}': {}", parts[i + 1], e.getMessage());
                }
            }
        }
        return 0;
    }

    private void restartEngineUnsafe() {
        try {
            if (writer != null) {
                writer.close();
            }
        } catch (IOException e) {
            log.debug("Failed to close writer smoothly during engine restart: {}", e.getMessage());
        }

        try {
            if (reader != null) {
                reader.close();
            }
        } catch (IOException e) {
            log.debug("Found exception closing reader during engine restart: {}", e.getMessage());
        }

        try {
            if (process != null) {
                process.destroyForcibly();
            }
        } catch (Exception e) {
            log.warn("Error encountered while forcibly destroying Stockfish process: {}", e.getMessage());
        } finally {
            process = null;
            reader = null;
            writer = null;
        }
    }

    String sendAndReadUntilBestMove(String positionCmd, int depth) throws IOException {
        ensureEngineRunning();
        sendCommandInternal(positionCmd);
        sendCommandInternal("go depth " + depth);

        StringBuilder outputBuffer = new StringBuilder();
        String line;
        while (reader != null && (line = reader.readLine()) != null) {
            outputBuffer.append(line).append("\n");
            if (line.startsWith("bestmove")) {
                break;
            }
        }
        return outputBuffer.toString();
    }

    @PreDestroy
    public void stopEngine() {
        engineLock.lock();
        try {
            if (process != null) {
                try {
                    if (process.isAlive()) {
                        sendCommandInternal("quit");
                    }
                } catch (Exception e) {
                    log.debug("Could not send graceful quit command to Stockfish during shutdown: {}", e.getMessage());
                }
                process.destroyForcibly();
                log.info("Stockfish engine stopped.");
            }
        } finally {
            restartEngineUnsafe();
            evaluationCache.clear();
            engineExecutor.shutdownNow();
            engineLock.unlock();
        }
    }
}
