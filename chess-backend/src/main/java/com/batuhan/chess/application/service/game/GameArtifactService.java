package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameExportResponse;
import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.repository.FileStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameArtifactService {

    private final FileStoragePort fileStoragePort;
    private final GameSessionManager sessionManager;

    public FileDownloadDTO exportGamePgn(String gameId) {
        Game game = sessionManager.getGame(gameId);
        if (game == null) {
            throw new ResourceNotFoundException("Game session not found with id: " + gameId);
        }

        String storageKey = "matches/pgn/" + gameId + ".pgn";

        if (!fileStoragePort.doesFileExist(storageKey)) {
            String pgnContent = generatePgnContent(game);
            byte[] bytes = pgnContent.getBytes(StandardCharsets.UTF_8);
            fileStoragePort.uploadFile(storageKey, new ByteArrayInputStream(bytes), bytes.length, "application/x-chess-pgn");
            log.info("PGN generated and archived to storage for gameId: {}", gameId);
        }

        byte[] pgnData = fileStoragePort.downloadFile(storageKey);
        return new FileDownloadDTO(pgnData, "application/x-chess-pgn", gameId + ".pgn");
    }

    public GameExportResponse uploadMatchArtifact(String gameId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Artifact file cannot be empty");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "artifact.bin";
        String storageKey = "matches/artifacts/" + gameId + "/" + filename;
        String contentType = file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        try {
            fileStoragePort.uploadFile(storageKey, file.getInputStream(), file.getSize(), contentType);
            log.info("Match artifact stored successfully: {}", storageKey);
        } catch (IOException e) {
            log.error("Failed to read artifact stream for gameId: {}", gameId, e);
            throw new RuntimeException("Failed to read artifact file", e);
        }

        return new GameExportResponse(gameId, storageKey, filename, file.getSize());
    }

    private String generatePgnContent(Game game) {
        String currentDate = LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));

        String whitePlayer = game.getWhitePlayerId() != null ? String.valueOf(game.getWhitePlayerId()) : "White";
        String blackPlayer = game.getBlackPlayerId() != null ? String.valueOf(game.getBlackPlayerId()) : "Black";
        String result = game.getStatus() != null ? game.getStatus().toString() : "*";

        String moves = (game.getHumanReadableHistory() != null && !game.getHumanReadableHistory().isEmpty())
            ? String.join(" ", game.getHumanReadableHistory()) + " " + result
            : result;

        return String.format(
            "[Event \"Chess Platform Match\"]%n" +
                "[Site \"chess-platform\"]%n" +
                "[Date \"%s\"]%n" +
                "[White \"%s\"]%n" +
                "[Black \"%s\"]%n" +
                "[Result \"%s\"]%n%n" +
                "%s",
            currentDate,
            whitePlayer,
            blackPlayer,
            result,
            moves
        );
    }
}
