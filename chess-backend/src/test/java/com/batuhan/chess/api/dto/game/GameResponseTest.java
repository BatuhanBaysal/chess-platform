package com.batuhan.chess.api.dto.game;

import com.batuhan.chess.domain.model.chess.Color;
import com.batuhan.chess.domain.model.chess.GameStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameResponse and ExecutedMove Unit Tests")
class GameResponseTest {

    @Test
    @DisplayName("Should build GameResponse and nested ExecutedMove with correct field values")
    void shouldBuildGameResponseSuccessfully() {
        // Arrange
        String gameId = "game-xyz";
        String boardRepr = "rnbqkbnr...";
        Color turn = Color.WHITE;
        GameStatus status = GameStatus.ACTIVE;

        GameResponse.ExecutedMove executedMove = new GameResponse.ExecutedMove(
            4, 1, 4, 3, "Pawn", 20, "GOOD"
        );
        List<GameResponse.ExecutedMove> lastMoves = List.of(executedMove);
        List<String> moveHistory = List.of("e2e4");
        String lastMoveMessage = "Pawn moved to e4";
        Long whiteId = 1L;
        Long blackId = 2L;
        boolean isStarted = true;
        long whiteTime = 300000L;
        long blackTime = 290000L;
        Integer timeLimit = 300;

        // Act
        GameResponse response = new GameResponse(
            gameId, boardRepr, turn, status, lastMoves, moveHistory,
            lastMoveMessage, whiteId, blackId, isStarted,
            whiteTime, blackTime, timeLimit
        );

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.gameId()).isEqualTo(gameId);
        assertThat(response.boardRepresentation()).isEqualTo(boardRepr);
        assertThat(response.currentTurn()).isEqualTo(turn);
        assertThat(response.status()).isEqualTo(status);
        assertThat(response.lastMoves())
            .isNotEmpty()
            .hasSize(1);
        assertThat(response.lastMoves().get(0).pieceType()).isEqualTo("Pawn");
        assertThat(response.moveHistory()).containsExactly("e2e4");
        assertThat(response.lastMoveMessage()).isEqualTo(lastMoveMessage);
        assertThat(response.whiteId()).isEqualTo(whiteId);
        assertThat(response.blackId()).isEqualTo(blackId);
        assertThat(response.isStarted()).isTrue();
        assertThat(response.whiteRemainingTimeMs()).isEqualTo(whiteTime);
        assertThat(response.blackRemainingTimeMs()).isEqualTo(blackTime);
        assertThat(response.timeLimit()).isEqualTo(timeLimit);
    }
}
