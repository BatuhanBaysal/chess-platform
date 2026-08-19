package com.batuhan.chess.application.service.game;

import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Game Session Manager Unit Tests")
class GameSessionManagerTest {

    private GameSessionManager sessionManager;

    private final String gameId = "room123";
    private final Long whiteId = 1L;
    private final Long blackId = 2L;

    @BeforeEach
    void setUp() {
        sessionManager = new GameSessionManager();
    }

    @Nested
    @DisplayName("Game Creation & Retrieval Operations")
    class CreationAndRetrievalTests {

        @Test
        @DisplayName("Should create and store new game with players successfully")
        void shouldCreateNewGameWithPlayers() {
            // Act
            sessionManager.createNewGameWithPlayers(gameId, whiteId, blackId, 10);

            // Assert
            Game game = sessionManager.getGame(gameId);
            assertThat(game).isNotNull();
            assertThat(game.getWhitePlayerId()).isEqualTo(whiteId);
            assertThat(game.getBlackPlayerId()).isEqualTo(blackId);
            assertThat(sessionManager.getActiveGames()).containsKey(gameId);
        }

        @Test
        @DisplayName("Should remove game and clean up all associated session resources")
        void shouldRemoveGameAndCleanUpResources() {
            // Arrange
            sessionManager.createNewGameWithPlayers(gameId, whiteId, blackId, 10);
            sessionManager.recordHeartbeat(gameId, whiteId);

            // Act
            sessionManager.removeGame(gameId);

            // Assert
            assertThat(sessionManager.getGame(gameId)).isNull();
            assertThat(sessionManager.getReadyPlayers()).doesNotContainKey(gameId);
            assertThat(sessionManager.getPlayerHeartbeats()).doesNotContainKey(gameId);
            assertThat(sessionManager.getLastBroadcastTimes()).doesNotContainKey(gameId);
        }
    }

    @Nested
    @DisplayName("Game Status & Readiness Rules")
    class ReadinessAndStatusTests {

        @Test
        @DisplayName("Should correctly evaluate if regular game has started based on ready players")
        void shouldEvaluateRegularGameStarted() {
            // Arrange
            sessionManager.createNewGameWithPlayers(gameId, whiteId, blackId, 10);
            assertThat(sessionManager.isGameStarted(gameId)).isFalse();

            // Act & Assert
            sessionManager.getReadyPlayers().computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(whiteId);
            assertThat(sessionManager.isGameStarted(gameId)).isFalse();

            // Act & Assert
            sessionManager.getReadyPlayers().get(gameId).add(blackId);
            assertThat(sessionManager.isGameStarted(gameId)).isTrue();
        }

        @Test
        @DisplayName("Should consider AI game started immediately when single player is ready")
        void shouldEvaluateAiGameStarted() {
            // Arrange
            sessionManager.createNewGameWithPlayers(gameId, whiteId, -1L, 10); // AI Game
            Game game = sessionManager.getGame(gameId);
            game.setBlackPlayerId(-1L);

            // Act
            sessionManager.getReadyPlayers().computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(whiteId);

            // Assert
            assertThat(sessionManager.isGameStarted(gameId)).isTrue();
        }

        @Test
        @DisplayName("Should find active game ID by user ID correctly while ignoring finished games")
        void shouldFindActiveGameIdByUserId() {
            // Arrange
            sessionManager.createNewGameWithPlayers(gameId, whiteId, blackId, 10);

            // Act
            String foundGameId = sessionManager.getActiveGameIdByUserId(whiteId);

            // Assert
            assertThat(foundGameId).isEqualTo(gameId);
            sessionManager.getGame(gameId).setStatus(GameStatus.CHECKMATE);
            assertThat(sessionManager.getActiveGameIdByUserId(whiteId)).isNull();
        }
    }

    @Nested
    @DisplayName("Heartbeat Tracking")
    class HeartbeatTests {

        @Test
        @DisplayName("Should record player heartbeat timestamp accurately")
        void shouldRecordPlayerHeartbeat() {
            // Act
            sessionManager.recordHeartbeat(gameId, whiteId);

            // Assert
            Map<String, ConcurrentHashMap<Long, Long>> heartbeats = sessionManager.getPlayerHeartbeats();
            assertThat(heartbeats).containsKey(gameId);
            assertThat(heartbeats.get(gameId)).containsKey(whiteId);
            assertThat(heartbeats.get(gameId).get(whiteId)).isLessThanOrEqualTo(System.currentTimeMillis());
        }
    }
}
