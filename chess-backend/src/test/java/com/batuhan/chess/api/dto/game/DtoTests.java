package com.batuhan.chess.api.dto.game;

import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit test suite for the DTO (Data Transfer Object) layer.
 * Ensures data integrity, correct builder pattern implementation,
 * and record-based equality logic for API communication objects.
 */
@DisplayName("DTO Layer Technical Tests")
class DtoTests {

    @Nested
    @DisplayName("MoveRequest Model Tests")
    class MoveRequestTests {

        @Test
        @DisplayName("Should maintain data integrity when creating a MoveRequest")
        void shouldMaintainDataIntegrityInMoveRequest() {
            // Arrange
            String gameId = "game-123";
            Integer fromFile = 0;
            Integer fromRank = 1;
            Integer toFile = 0;
            Integer toRank = 2;
            String promotion = "QUEEN";

            // Act
            MoveRequest request = new MoveRequest(gameId, fromFile, fromRank, toFile, toRank, promotion);

            // Assert
            assertThat(request)
                .isNotNull()
                .satisfies(req -> {
                    assertThat(req.gameId()).isEqualTo(gameId);
                    assertThat(req.fromFile()).isEqualTo(fromFile);
                    assertThat(req.fromRank()).isEqualTo(fromRank);
                    assertThat(req.toFile()).isEqualTo(toFile);
                    assertThat(req.toRank()).isEqualTo(toRank);
                    assertThat(req.promotionType()).isEqualTo(promotion);
                });
        }

        @Test
        @DisplayName("Should accept null as a valid promotion type for non-pawn moves")
        void shouldHandleNullPromotionType() {
            // Act
            MoveRequest request = new MoveRequest("id", 0, 0, 1, 1, null);

            // Assert
            assertThat(request.promotionType()).isNull();
        }
    }

    @Nested
    @DisplayName("GameHistory Model Tests")
    class GameHistoryTests {

        @Test
        @DisplayName("Should correctly map all fields when using the GameHistory builder")
        void shouldBuildGameHistorySuccessfully() {
            // Arrange
            LocalDateTime now = LocalDateTime.now();

            // Act
            GameHistory history = GameHistory.builder()
                .id(1L)
                .whitePlayerName("WhitePlayer")
                .blackPlayerName("BlackPlayer")
                .result(GameResult.WHITE_WIN)
                .finishMethod(GameStatus.CHECKMATE)
                .playedAt(now)
                .build();

            // Assert
            assertThat(history)
                .isNotNull()
                .satisfies(h -> {
                    assertThat(h.id()).isEqualTo(1L);
                    assertThat(h.whitePlayerName()).isEqualTo("WhitePlayer");
                    assertThat(h.blackPlayerName()).isEqualTo("BlackPlayer");
                    assertThat(h.result()).isEqualTo(GameResult.WHITE_WIN);
                    assertThat(h.finishMethod()).isEqualTo(GameStatus.CHECKMATE);
                    assertThat(h.playedAt()).isEqualTo(now);
                });
        }

        @Test
        @DisplayName("Should verify object equality and hashCode consistency for identical data")
        void shouldVerifyEqualityAndHashCodeConsistency() {
            // Arrange
            LocalDateTime now = LocalDateTime.now();
            GameHistory history1 = GameHistory.builder().id(1L).playedAt(now).build();
            GameHistory history2 = GameHistory.builder().id(1L).playedAt(now).build();

            // Assert
            assertThat(history1)
                .isEqualTo(history2)
                .hasSameHashCodeAs(history2);
        }
    }
}
