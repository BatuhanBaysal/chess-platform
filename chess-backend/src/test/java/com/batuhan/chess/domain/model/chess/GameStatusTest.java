package com.batuhan.chess.domain.model.chess;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for GameStatus enum logic.
 * Ensures terminal and non-terminal states are correctly identified.
 */
@DisplayName("Game Status Enum Logic Tests")
class GameStatusTest {

    @Nested
    @DisplayName("Terminal State Checks")
    class TerminalStateTests {

        @ParameterizedTest
        @EnumSource(value = GameStatus.class, names = {
            "CHECKMATE", "STALEMATE", "RESIGNED", "TIMEOUT", "DRAW", "CLOSING"
        })
        @DisplayName("Should return true for terminal game statuses")
        void shouldReturnTrueForTerminalStatuses(GameStatus status) {
            // Act
            boolean finished = status.isFinished();

            // Assert
            assertThat(finished)
                .as("Status %s should be considered a terminal state", status)
                .isTrue();
        }

        @ParameterizedTest
        @EnumSource(value = GameStatus.class, names = {"ACTIVE", "CHECK"})
        @DisplayName("Should return false for active/non-terminal game statuses")
        void shouldReturnFalseForActiveStatuses(GameStatus status) {
            // Act
            boolean finished = status.isFinished();

            // Assert
            assertThat(finished)
                .as("Status %s should not be considered a terminal state", status)
                .isFalse();
        }
    }

    @Nested
    @DisplayName("Enum Integrity Tests")
    class IntegrityTests {

        @Test
        @DisplayName("Should correctly map string names to enum constants")
        void shouldMapCorrectlyViaValueOf() {
            // Arrange
            String activeStr = "ACTIVE";
            String mateStr = "CHECKMATE";

            // Act
            GameStatus active = GameStatus.valueOf(activeStr);
            GameStatus mate = GameStatus.valueOf(mateStr);

            // Assert
            assertThat(active).isEqualTo(GameStatus.ACTIVE);
            assertThat(mate).isEqualTo(GameStatus.CHECKMATE);
            assertThat(GameStatus.values())
                .contains(GameStatus.STALEMATE, GameStatus.RESIGNED);
        }
    }
}
