package com.batuhan.chess.api.dto.game;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GameAnalysisMessageTest {

    @Test
    void gameAnalysisMessage_ShouldStoreAndReturnCorrectValues() {
        // Arrange
        String gameId = "game-123";
        String pgn = "1. e4 e5";
        List<String> moves = List.of("e4", "e5");
        Long whiteId = 1L;
        Long blackId = 2L;

        // Act
        GameAnalysisMessage message = new GameAnalysisMessage(gameId, pgn, moves, whiteId, blackId);

        // Assert
        assertThat(message.gameId()).isEqualTo(gameId);
        assertThat(message.pgn()).isEqualTo(pgn);
        assertThat(message.moves()).isEqualTo(moves);
        assertThat(message.whitePlayerId()).isEqualTo(whiteId);
        assertThat(message.blackPlayerId()).isEqualTo(blackId);
    }
}
