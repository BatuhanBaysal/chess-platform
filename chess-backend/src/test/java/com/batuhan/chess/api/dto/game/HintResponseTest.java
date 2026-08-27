package com.batuhan.chess.api.dto.game;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("HintResponse Unit Tests")
class HintResponseTest {

    @Test
    @DisplayName("Should create HintResponse with correct fields")
    void shouldCreateHintResponse() {
        // Arrange
        String bestMoveUci = "e2e4";
        int evaluationScore = 45;
        String message = "Best move calculated.";

        // Act
        HintResponse response = new HintResponse(bestMoveUci, evaluationScore, message);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.bestMoveUci()).isEqualTo(bestMoveUci);
        assertThat(response.evaluationScore()).isEqualTo(evaluationScore);
        assertThat(response.message()).isEqualTo(message);
    }
}
