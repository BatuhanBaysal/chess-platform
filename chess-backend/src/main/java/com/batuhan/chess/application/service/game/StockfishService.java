package com.batuhan.chess.application.service.game;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Slf4j
@Service
public class StockfishService {

    private Process process;
    private BufferedReader reader;
    private OutputStreamWriter writer;

    public synchronized void startEngine() {
        try {
            ProcessBuilder builder;
            String osName = System.getProperty("os.name").toLowerCase();
            String engineResourcePath = osName.contains("win")
                ? "engine/stockfish.exe"
                : "engine/stockfish";

            File tempEngineFile = extractEngineToTemp(engineResourcePath);
            builder = new ProcessBuilder(tempEngineFile.getAbsolutePath());

            process = builder.start();
            reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            writer = new OutputStreamWriter(process.getOutputStream());

            sendCommand("uci");
            sendCommand("isready");
            log.info("Stockfish engine successfully started using binary: {}", engineResourcePath);
        } catch (IOException e) {
            log.error("Failed to start Stockfish engine: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to start Stockfish engine", e);
        }
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

    public synchronized String getBestMove(List<String> moveHistory, int depth) {
        if (process == null || !process.isAlive()) {
            startEngine();
        }

        try {
            String positionCmd = "position startpos";
            if (moveHistory != null && !moveHistory.isEmpty()) {
                positionCmd += " moves " + String.join(" ", moveHistory);
            }

            sendCommand(positionCmd);
            sendCommand("go depth " + depth);

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("bestmove")) {
                    String[] parts = line.split(" ");
                    return parts[1];
                }
            }
        } catch (IOException e) {
            log.error("Error communicating with Stockfish: {}", e.getMessage(), e);
        }
        return null;
    }

    private void sendCommand(String command) throws IOException {
        if (writer != null) {
            writer.write(command + "\n");
            writer.flush();
        }
    }

    public synchronized int getEvaluation(List<String> moveHistory, int depth) {
        if (process == null || !process.isAlive()) {
            startEngine();
        }

        try {
            sendEvaluationCommands(moveHistory, depth);
            return readEvaluationResult();
        } catch (IOException e) {
            log.error("Error getting evaluation from Stockfish: {}", e.getMessage(), e);
        }
        return 0;
    }

    private void sendEvaluationCommands(List<String> moveHistory, int depth) throws IOException {
        String positionCmd = "position startpos";
        if (moveHistory != null && !moveHistory.isEmpty()) {
            positionCmd += " moves " + String.join(" ", moveHistory);
        }

        sendCommand(positionCmd);
        sendCommand("go depth " + depth);
    }

    private int readEvaluationResult() throws IOException {
        int currentScore = 0;
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.contains("score cp")) {
                currentScore = parseCentipawnScore(line);
            } else if (line.contains("score mate")) {
                currentScore = parseMateScore(line);
            }
            if (line.startsWith("bestmove")) {
                break;
            }
        }
        return currentScore;
    }

    private int parseCentipawnScore(String line) {
        String[] parts = line.split(" ");
        for (int i = 0; i < parts.length; i++) {
            if ("cp".equals(parts[i]) && i + 1 < parts.length) {
                return Integer.parseInt(parts[i + 1]);
            }
        }
        return 0;
    }

    private int parseMateScore(String line) {
        String[] parts = line.split(" ");
        for (int i = 0; i < parts.length; i++) {
            if ("mate".equals(parts[i]) && i + 1 < parts.length) {
                int mateIn = Integer.parseInt(parts[i + 1]);
                return mateIn > 0 ? 10000 - (mateIn * 100) : -10000 - (mateIn * 100);
            }
        }
        return 0;
    }

    @PreDestroy
    public synchronized void stopEngine() {
        if (process != null) {
            try {
                if (process.isAlive()) {
                    tryQuitCommand();
                }
                process.destroyForcibly();
                log.info("Stockfish engine stopped.");
            } catch (Exception e) {
                log.error("Error stopping Stockfish: {}", e.getMessage(), e);
            } finally {
                process = null;
                writer = null;
                reader = null;
            }
        }
    }

    private void tryQuitCommand() {
        try {
            sendCommand("quit");
        } catch (Exception e) {
            log.debug("Could not send quit command to Stockfish gracefully: {}", e.getMessage());
        }
    }
}
