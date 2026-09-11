package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameExportResponse;
import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.repository.FileStoragePort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameArtifactServiceTest {

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private GameSessionManager sessionManager;

    @InjectMocks
    private GameArtifactService gameArtifactService;

    private Game testGame;
    private final String gameId = "game123";

    @BeforeEach
    void setUp() {
        testGame = new Game(new Board());
        testGame.setWhitePlayerId(10L);
        testGame.setBlackPlayerId(20L);
        testGame.setStatus(GameStatus.CHECKMATE);
        testGame.getHumanReadableHistory().add("1. e4 e5");
    }

    @Nested
    @DisplayName("PGN Export Tests")
    class ExportGamePgnTests {

        @Test
        @DisplayName("Should generate, upload, and download PGN when it does not exist in storage")
        void exportGamePgn_FileDoesNotExist_GeneratesAndReturnsPgn() {
            // Arrange
            String storageKey = "matches/pgn/game123.pgn";
            byte[] dummyPgnData = "dummy pgn content".getBytes();

            when(sessionManager.getGame(gameId)).thenReturn(testGame);
            when(fileStoragePort.doesFileExist(storageKey)).thenReturn(false);
            when(fileStoragePort.uploadFile(eq(storageKey), any(InputStream.class), anyLong(), eq("application/x-chess-pgn")))
                .thenReturn(storageKey);
            when(fileStoragePort.downloadFile(storageKey)).thenReturn(dummyPgnData);

            // Act
            FileDownloadDTO result = gameArtifactService.exportGamePgn(gameId);

            // Assert
            assertNotNull(result);
            assertArrayEquals(dummyPgnData, result.data());
            assertEquals("application/x-chess-pgn", result.contentType());
            assertEquals("game123.pgn", result.fileName());
            verify(fileStoragePort, times(1)).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
            verify(fileStoragePort, times(1)).downloadFile(storageKey);
        }

        @Test
        @DisplayName("Should download existing PGN directly without generating")
        void exportGamePgn_FileExists_DownloadsDirectly() {
            // Arrange
            String storageKey = "matches/pgn/game123.pgn";
            byte[] dummyPgnData = "existing pgn content".getBytes();

            when(sessionManager.getGame(gameId)).thenReturn(testGame);
            when(fileStoragePort.doesFileExist(storageKey)).thenReturn(true);
            when(fileStoragePort.downloadFile(storageKey)).thenReturn(dummyPgnData);

            // Act
            FileDownloadDTO result = gameArtifactService.exportGamePgn(gameId);

            // Assert
            assertNotNull(result);
            assertArrayEquals(dummyPgnData, result.data());
            verify(fileStoragePort, never()).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
            verify(fileStoragePort, times(1)).downloadFile(storageKey);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when game session is not found")
        void exportGamePgn_GameNotFound_ThrowsException() {
            // Arrange
            when(sessionManager.getGame("unknownId")).thenReturn(null);

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> gameArtifactService.exportGamePgn("unknownId"));
            assertTrue(exception.getMessage().contains("Game session not found"));
        }
    }

    @Nested
    @DisplayName("Match Artifact Upload Tests")
    class UploadMatchArtifactTests {

        @Test
        @DisplayName("Should successfully upload artifact and return response")
        void uploadMatchArtifact_ValidFile_UploadsAndReturnsResponse() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                "file", "engine-log.txt", MediaType.TEXT_PLAIN_VALUE, "log content".getBytes()
            );

            when(fileStoragePort.uploadFile(
                eq("matches/artifacts/game123/engine-log.txt"),
                any(InputStream.class),
                eq((long) file.getSize()),
                eq(MediaType.TEXT_PLAIN_VALUE)
            )).thenReturn("matches/artifacts/game123/engine-log.txt");

            // Act
            GameExportResponse response = gameArtifactService.uploadMatchArtifact(gameId, file);

            // Assert
            assertNotNull(response);
            assertEquals(gameId, response.gameId());
            assertEquals("matches/artifacts/game123/engine-log.txt", response.storageKey());
            assertEquals("engine-log.txt", response.fileName());
            assertEquals(file.getSize(), response.sizeInBytes());
            verify(fileStoragePort, times(1)).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
        }

        @Test
        @DisplayName("Should throw exception when artifact file is empty")
        void uploadMatchArtifact_EmptyFile_ThrowsException() {
            // Arrange
            MockMultipartFile emptyFile = new MockMultipartFile("file", new byte[0]);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> gameArtifactService.uploadMatchArtifact(gameId, emptyFile));
            assertEquals("Artifact file cannot be empty", exception.getMessage());
            verify(fileStoragePort, never()).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
        }
    }
}
