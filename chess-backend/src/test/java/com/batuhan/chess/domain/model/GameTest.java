package com.batuhan.chess.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class GameTest {

    private Game game;

    @BeforeEach
    void setUp() {
        game = new Game();
    }

    @Test
    @DisplayName("Game should start with White turn ACTIVE status.")
    void gameShouldInitializeCorrectly() {
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
        assertThat(game.getStatus()).isEqualTo(GameStatus.ACTIVE);
    }

    @Test
    @DisplayName("Turn should switch to Black after a valid White move.")
    void turnShouldSwitchAfterValidMove() {
        // Arrange
        Position start = new Position(4, 1); // e2
        Position end = new Position(4, 3); // e4

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isTrue();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.BLACK);
    }

    @Test
    @DisplayName("Black should not be able to move during White's turn.")
    void shouldNotAllowMovingOutOfTurn() {
        // Arrange
        Position start = new Position(4, 6); // e7
        Position end = new Position(4, 4); // e5

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isFalse();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
    }

    @Test
    @DisplayName("Should not allow move if target is invalid for the piece.")
    void shouldNotAllowInvalidPieceMove() {
        // Arrange
        Position start = new Position(4, 1); // e2
        Position end = new Position(5, 3); // f4

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isFalse();
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
    }

    @Test
    @DisplayName("Should not allow moves when game is not ACTIVE.")
    void shouldNotMoveWhenGameIsNotActive() {
        // Arrange
        game.resign(Color.WHITE);
        Position start = new Position(4, 1); // e2
        Position end = new Position(4, 3); // e4

        // Act
        boolean moved = game.makeMove(start, end);

        // Assert
        assertThat(moved).isFalse();
        assertThat(game.getStatus()).isEqualTo(GameStatus.RESIGNED);
        assertThat(game.getCurrentTurn()).isEqualTo(Color.WHITE);
    }
}
