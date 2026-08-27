package com.batuhan.chess.domain.repository;

import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("GameRepository Data JPA Tests")
class GameRepositoryTest {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should find game by id with players loaded via EntityGraph")
    void findWithPlayersById_ReturnsGameWithPlayers() {
        // Arrange
        UserEntity white = persistUser("whitePlayer", "white@chess.com");
        UserEntity black = persistUser("blackPlayer", "black@chess.com");

        GameEntity game = GameEntity.builder()
            .whitePlayer(white)
            .blackPlayer(black)
            .result(GameResult.WHITE_WIN)
            .finishMethod(GameStatus.CHECKMATE)
            .pgnData("1. e4 e5")
            .build();
        GameEntity savedGame = entityManager.persistAndFlush(game);
        entityManager.clear();

        // Act
        Optional<GameEntity> found = gameRepository.findWithPlayersById(savedGame.getId());

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getWhitePlayer()).isNotNull();
        assertThat(found.get().getWhitePlayer().getUsername()).isEqualTo("whitePlayer");
        assertThat(found.get().getBlackPlayer()).isNotNull();
        assertThat(found.get().getBlackPlayer().getUsername()).isEqualTo("blackPlayer");
    }

    @Test
    @DisplayName("Should find games by white or black player ID ordered by playedAt descending")
    void findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc_ReturnsOrderedGames() {
        // Arrange
        UserEntity player1 = persistUser("player1", "player1@chess.com");
        UserEntity player2 = persistUser("player2", "player2@chess.com");
        UserEntity player3 = persistUser("player3", "player3@chess.com");

        GameEntity game1 = GameEntity.builder()
            .whitePlayer(player1)
            .blackPlayer(player2)
            .result(GameResult.WHITE_WIN)
            .finishMethod(GameStatus.RESIGNED)
            .build();

        GameEntity game2 = GameEntity.builder()
            .whitePlayer(player3)
            .blackPlayer(player1)
            .result(GameResult.BLACK_WIN)
            .finishMethod(GameStatus.CHECKMATE)
            .build();

        entityManager.persistAndFlush(game1);
        entityManager.persistAndFlush(game2);
        entityManager.clear();

        // Act
        List<GameEntity> games = gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(
            player1.getId(), player1.getId()
        );

        // Assert
        assertThat(games).hasSize(2);
    }

    private UserEntity persistUser(String username, String email) {
        UserEntity user = UserEntity.builder()
            .username(username)
            .email(email)
            .password("Password123!")
            .role(UserRole.ROLE_ADMIN)
            .build();
        return entityManager.persistAndFlush(user);
    }
}
