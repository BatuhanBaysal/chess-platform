package com.batuhan.chess.application.service.game;

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

    public void startEngine() {
        engineLock.lock();
        try {
            if (process != null && process.isAlive()) {
                return;
            }

            restartEngineUnsafe();
            String osName = System.getProperty("os.name").toLowerCase();
            String engineResourcePath = osName.contains("win")
                ? "engine/stockfish.exe"
                : "engine/stockfish";

            File tempEngineFile = extractEngineToTemp(engineResourcePath);
            ProcessBuilder builder = new ProcessBuilder(tempEngineFile.getAbsolutePath());

            this.process = builder.start();
            initializeProcessStreams(this.process);
            log.info("Stockfish engine successfully started using binary: {}", engineResourcePath);

        } catch (IOException e) {
            log.error("Failed to start Stockfish engine: {}", e.getMessage(), e);
            restartEngineUnsafe();
            throw new RuntimeException("Failed to start Stockfish engine", e);
        } finally {
            engineLock.unlock();
        }
    }

    private void initializeProcessStreams(Process activeProcess) throws IOException {
        this.reader = new BufferedReader(new InputStreamReader(activeProcess.getInputStream()));
        this.writer = new OutputStreamWriter(activeProcess.getOutputStream());

        sendCommandInternal("uci");
        sendCommandInternal("isready");
    }

    private File extractEngineToTemp(String resourcePath) throws IOException {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            if (inputStream == null) {
                throw new FileNotFoundException("Stockfish binary not found in resources/" + resourcePath);
            }

            Path userTemp = Path.of(System.getProperty("java.io.tmpdir"));
            Path tempDir = Files.createDirectories(userTemp.resolve("chess-engine-" + System.currentTimeMillis()));

            String fileName = resourcePath.contains("win") ? "stockfish.exe" : "stockfish";
            File tempFile = tempDir.resolve(fileName).toFile();

            Files.copy(inputStream, tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

            boolean isExecutableSet = tempFile.setExecutable(true);
            if (!isExecutableSet && !tempFile.canExecute()) {
                throw new IOException("Failed to set execution permission for Stockfish binary.");
            }

            return tempFile;
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
            startEngineInternal();
        }
    }

    private void startEngineInternal() throws IOException {
        String osName = System.getProperty("os.name").toLowerCase();
        String engineResourcePath = osName.contains("win") ? "engine/stockfish.exe" : "engine/stockfish";
        File tempEngineFile = extractEngineToTemp(engineResourcePath);

        ProcessBuilder builder = new ProcessBuilder(tempEngineFile.getAbsolutePath());
        process = builder.start();
        initializeProcessStreams(process);
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
            log.debug("Failed to close reader smoothly during engine restart: {}", e.getMessage());
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

    private String sendAndReadUntilBestMove(String positionCmd, int depth) throws IOException {
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
