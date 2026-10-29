package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameExportResponse;
import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.repository.FileStoragePort;
import com.batuhan.chess.domain.repository.GameRepository;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GameArtifactService Unit Tests")
class GameArtifactServiceTest {

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private GameSessionManager sessionManager;

    @Mock
    private GameRepository gameRepository;

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
    @DisplayName("PGN Export Operations")
    class ExportGamePgnTests {

        @Test
        @DisplayName("Should generate, upload, and return PGN bytes when file does not exist in storage")
        void shouldGenerateAndUploadPgn_WhenFileNotInStorage() {
            // Arrange
            String storageKey = "matches/pgn/game123.pgn";
            when(fileStoragePort.doesFileExist(storageKey)).thenReturn(false);
            when(sessionManager.getGame(gameId)).thenReturn(testGame);
            when(fileStoragePort.uploadFile(eq(storageKey), any(InputStream.class), anyLong(), eq("application/x-chess-pgn")))
                .thenReturn(storageKey);

            // Act
            FileDownloadDTO result = gameArtifactService.exportGamePgn(gameId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(new String(result.data(), StandardCharsets.UTF_8)).contains("1. e4 e5");
            assertThat(result.contentType()).isEqualTo("application/x-chess-pgn");
            assertThat(result.fileName()).isEqualTo("game123.pgn");
            verify(fileStoragePort).uploadFile(eq(storageKey), any(InputStream.class), anyLong(), eq("application/x-chess-pgn"));
        }

        @Test
        @DisplayName("Should download existing PGN directly without generating")
        void shouldDownloadExistingPgn_WhenFileAlreadyExists() {
            // Arrange
            String storageKey = "matches/pgn/game123.pgn";
            byte[] dummyPgnData = "existing pgn content".getBytes(StandardCharsets.UTF_8);
            when(fileStoragePort.doesFileExist(storageKey)).thenReturn(true);
            when(fileStoragePort.downloadFile(storageKey)).thenReturn(dummyPgnData);

            // Act
            FileDownloadDTO result = gameArtifactService.exportGamePgn(gameId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.data()).isEqualTo(dummyPgnData);
            verify(fileStoragePort, never()).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
            verify(fileStoragePort).downloadFile(storageKey);
            verifyNoInteractions(sessionManager);
        }

        @Test
        @DisplayName("Should fetch archived PGN from database when active session does not exist")
        void shouldFetchArchivedPgnFromDatabase_WhenSessionMissing() {
            // Arrange
            String storageKey = "matches/pgn/123.pgn";
            GameEntity archived = new GameEntity();
            archived.setId(123L);
            archived.setPgnData("1. d4 d5 1-0");

            when(fileStoragePort.doesFileExist(storageKey)).thenReturn(false);
            when(sessionManager.getGame("123")).thenReturn(null);
            when(gameRepository.findById(123L)).thenReturn(Optional.of(archived));

            // Act
            FileDownloadDTO result = gameArtifactService.exportGamePgn("123");

            // Assert
            assertThat(result).isNotNull();
            assertThat(new String(result.data(), StandardCharsets.UTF_8)).isEqualTo("1. d4 d5 1-0");
            verify(fileStoragePort).uploadFile(eq(storageKey), any(InputStream.class), anyLong(), eq("application/x-chess-pgn"));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when game session and database record are absent")
        void shouldThrowResourceNotFoundException_WhenGameNotFound() {
            // Arrange
            when(fileStoragePort.doesFileExist(anyString())).thenReturn(false);
            when(sessionManager.getGame("unknownId")).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> gameArtifactService.exportGamePgn("unknownId"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Game session or archived PGN not found with id: unknownId");
        }
    }

    @Nested
    @DisplayName("Match Artifact Upload Operations")
    class UploadMatchArtifactTests {

        @Test
        @DisplayName("Should upload artifact and return response when file is valid")
        void shouldUploadArtifact_WhenFileIsValid() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                "file", "engine-log.txt", MediaType.TEXT_PLAIN_VALUE, "log content".getBytes(StandardCharsets.UTF_8)
            );

            when(fileStoragePort.uploadFile(
                eq("matches/artifacts/game123/engine-log.txt"),
                any(InputStream.class),
                eq(file.getSize()),
                eq(MediaType.TEXT_PLAIN_VALUE)
            )).thenReturn("matches/artifacts/game123/engine-log.txt");

            // Act
            GameExportResponse response = gameArtifactService.uploadMatchArtifact(gameId, file);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.gameId()).isEqualTo(gameId);
            assertThat(response.storageKey()).isEqualTo("matches/artifacts/game123/engine-log.txt");
            assertThat(response.fileName()).isEqualTo("engine-log.txt");
            assertThat(response.sizeInBytes()).isEqualTo(file.getSize());
            verify(fileStoragePort).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
        }

        @Test
        @DisplayName("Should default filename and content type when not specified in file")
        void shouldDefaultFilenameAndContentType_WhenNotProvided() throws IOException {
            // Arrange
            byte[] content = "log data".getBytes(StandardCharsets.UTF_8);
            MultipartFile file = mock(MultipartFile.class);
            when(file.isEmpty()).thenReturn(false);
            when(file.getOriginalFilename()).thenReturn(null);
            when(file.getContentType()).thenReturn(null);
            when(file.getSize()).thenReturn((long) content.length);
            when(file.getInputStream()).thenReturn(new ByteArrayInputStream(content));

            String expectedStorageKey = "matches/artifacts/game123/artifact.bin";

            when(fileStoragePort.uploadFile(
                eq(expectedStorageKey),
                any(InputStream.class),
                eq((long) content.length),
                eq(MediaType.APPLICATION_OCTET_STREAM_VALUE)
            )).thenReturn(expectedStorageKey);

            // Act
            GameExportResponse response = gameArtifactService.uploadMatchArtifact(gameId, file);

            // Assert
            assertThat(response.fileName()).isEqualTo("artifact.bin");
            assertThat(response.storageKey()).isEqualTo(expectedStorageKey);
            verify(fileStoragePort).uploadFile(
                eq(expectedStorageKey),
                any(InputStream.class),
                eq((long) content.length),
                eq(MediaType.APPLICATION_OCTET_STREAM_VALUE)
            );
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when artifact file is empty")
        void shouldThrowIllegalArgumentException_WhenFileIsEmpty() {
            // Arrange
            MockMultipartFile emptyFile = new MockMultipartFile("file", new byte[0]);

            // Act & Assert
            assertThatThrownBy(() -> gameArtifactService.uploadMatchArtifact(gameId, emptyFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Artifact file cannot be empty");

            verify(fileStoragePort, never()).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());
        }
    }
}
