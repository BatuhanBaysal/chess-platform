package com.batuhan.chess.application.service.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Technical test suite for EloService.
 * Validates the Elo rating system calculations, ensuring correct point gains/losses,
 * handling of edge cases for extreme rating gaps, and guard clauses for invalid inputs.
 */
@DisplayName("Elo Service Calculation Tests")
class EloServiceTest {

    private EloService eloService;

    @BeforeEach
    void setUp() {
        eloService = new EloService();
    }

    @Nested
    @DisplayName("Standard Rating Calculations")
    class StandardCalculationTests {

        @Test
        @DisplayName("Should return zero gain when players with identical ratings result in a draw")
        void shouldReturnZeroGainForEqualDraw() {
            // Arrange
            int rating = 1500;
            double drawScore = 0.5;

            // Act
            int gain = eloService.calculateGain(rating, rating, drawScore);

            // Assert
            assertThat(gain).as("A draw between equal ratings should result in 0 points change")
                .isZero();
        }

        @Test
        @DisplayName("Should return a positive gain when a lower-rated player wins against a higher-rated one")
        void shouldReturnPositiveGainOnUnderdogWin() {
            // Act
            int gain = eloService.calculateGain(1200, 1600, 1.0);

            // Assert
            assertThat(gain).as("Winning against a higher rated player should yield positive points")
                .isPositive();
        }

        @Test
        @DisplayName("Should return a negative gain when a higher-rated player loses to a lower-rated one")
        void shouldReturnNegativeGainOnFavoriteLoss() {
            // Act
            int gain = eloService.calculateGain(1600, 1200, 0.0);

            // Assert
            assertThat(gain).as("Losing to a lower rated player should yield negative points")
                .isNegative();
        }
    }

    @Nested
    @DisplayName("Boundary and Extreme Gap Guards")
    class BoundaryTests {

        @ParameterizedTest
        @CsvSource({
            "2800, 400, 1.0, 1",
            "400, 2800, 0.0, -1",
            "3500, 100, 1.0, 1",
            "100, 3500, 0.0, -1"
        })
        @DisplayName("Should verify minimum/maximum point guards for extreme rating differences")
        void shouldVerifyPointGuardsForExtremeDifferences(int pRating, int oRating, double score, int expectedGain) {
            // Act
            int gain = eloService.calculateGain(pRating, oRating, score);

            // Assert
            assertThat(gain).as("Even with massive gaps, winner must gain 1 and loser must lose 1")
                .isEqualTo(expectedGain);
        }

        @Test
        @DisplayName("Should handle invalid or negative opponent ratings by defaulting to 1200")
        void shouldHandleInvalidOpponentRating() {
            // Arrange
            int playerRating = 1200;
            double drawScore = 0.5;

            // Act
            int zeroGain = eloService.calculateGain(playerRating, 0, drawScore);
            int negativeGain = eloService.calculateGain(playerRating, -500, drawScore);

            // Assert
            assertThat(zeroGain).as("0 rating should be treated as 1200, resulting in 0 for a draw").isZero();
            assertThat(negativeGain).as("Negative rating should be treated as 1200, resulting in 0 for a draw").isZero();
        }
    }
}
