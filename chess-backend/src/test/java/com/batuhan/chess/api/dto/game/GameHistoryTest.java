package com.batuhan.chess.api.dto.game;

import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GameHistory Unit Tests")
class GameHistoryTest {

    @Test
    @DisplayName("Should build GameHistory with correct field values")
    void shouldBuildGameHistory() {
        // Arrange
        Long id = 100L;
        Long whiteId = 1L;
        String whiteName = "batuhan";
        Long blackId = 2L;
        String blackName = "opponent";
        GameResult result = GameResult.WHITE_WIN;
        GameStatus finishMethod = GameStatus.CHECKMATE;
        LocalDateTime now = LocalDateTime.now();

        // Act
        GameHistory history = GameHistory.builder()
            .id(id)
            .whitePlayerId(whiteId)
            .whitePlayerName(whiteName)
            .blackPlayerId(blackId)
            .blackPlayerName(blackName)
            .result(result)
            .finishMethod(finishMethod)
            .playedAt(now)
            .build();

        // Assert
        assertThat(history).isNotNull();
        assertThat(history.id()).isEqualTo(id);
        assertThat(history.whitePlayerId()).isEqualTo(whiteId);
        assertThat(history.whitePlayerName()).isEqualTo(whiteName);
        assertThat(history.blackPlayerId()).isEqualTo(blackId);
        assertThat(history.blackPlayerName()).isEqualTo(blackName);
        assertThat(history.result()).isEqualTo(result);
        assertThat(history.finishMethod()).isEqualTo(finishMethod);
        assertThat(history.playedAt()).isEqualTo(now);
    }
}
