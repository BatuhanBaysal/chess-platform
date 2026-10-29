package com.batuhan.chess.domain.repository;

import com.batuhan.chess.AbstractIntegrationTest;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("GameRepository Integration Tests")
class GameRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private EntityManager entityManager;

    @SuppressWarnings("SqlNoDataSourceInspection")
    @BeforeEach
    void setUp() {
        entityManager.createNativeQuery("TRUNCATE TABLE audit_logs, games, users CASCADE").executeUpdate();
        entityManager.flush();
        entityManager.clear();
    }

    @Nested
    @DisplayName("findWithPlayersById")
    class FindWithPlayersByIdTests {

        @Test
        @DisplayName("Should return game with eagerly loaded players when game ID exists")
        void shouldReturnGameWithPlayers_WhenGameIdExists() {
            // Arrange
            UserEntity white = persistUser("whitePlayer", "white@chess.com");
            UserEntity black = persistUser("blackPlayer", "black@chess.com");
            GameEntity savedGame = persistGame(white, black, GameResult.WHITE_WIN, GameStatus.CHECKMATE, LocalDateTime.now(ZoneOffset.UTC));

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
        @DisplayName("Should return empty Optional when game ID does not exist")
        void shouldReturnEmptyOptional_WhenGameIdDoesNotExist() {
            // Act
            Optional<GameEntity> found = gameRepository.findWithPlayersById(999999L);

            // Assert
            assertThat(found).isNotPresent();
        }

        @Test
        @DisplayName("Should return game with null opponent when match was played against bot or guest is removed")
        void shouldReturnGame_WhenOpponentIsNull() {
            // Arrange
            UserEntity white = persistUser("humanPlayer", "human@chess.com");
            GameEntity savedGame = persistGame(white, null, GameResult.WHITE_WIN, GameStatus.CHECKMATE, LocalDateTime.now(ZoneOffset.UTC));

            // Act
            Optional<GameEntity> found = gameRepository.findWithPlayersById(savedGame.getId());

            // Assert
            assertThat(found).isPresent();
            assertThat(found.get().getWhitePlayer()).isNotNull();
            assertThat(found.get().getWhitePlayer().getUsername()).isEqualTo("humanPlayer");
            assertThat(found.get().getBlackPlayer()).isNull();
        }
    }

    @Nested
    @DisplayName("findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc")
    class FindByPlayerHistoryTests {

        @Test
        @DisplayName("Should return games ordered by playedAt descending when player participated")
        void shouldReturnOrderedGames_WhenPlayerHasMatchHistory() {
            // Arrange
            UserEntity player1 = persistUser("player1", "player1@chess.com");
            UserEntity player2 = persistUser("player2", "player2@chess.com");

            LocalDateTime olderMatch = LocalDateTime.of(2026, 1, 1, 12, 0);
            LocalDateTime newerMatch = LocalDateTime.of(2026, 1, 2, 12, 0);

            persistGame(player1, player2, GameResult.WHITE_WIN, GameStatus.RESIGNED, olderMatch);
            persistGame(player2, player1, GameResult.BLACK_WIN, GameStatus.CHECKMATE, newerMatch);

            // Act
            List<GameEntity> games = gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(
                player1.getId(), player1.getId()
            );

            // Assert
            assertThat(games)
                .hasSize(2)
                .extracting(GameEntity::getPlayedAt)
                .containsExactly(newerMatch, olderMatch);
        }

        @Test
        @DisplayName("Should return empty list when player has no recorded matches")
        void shouldReturnEmptyList_WhenPlayerHasNoMatches() {
            // Arrange
            UserEntity playerWithoutGames = persistUser("newbie", "newbie@chess.com");

            // Act
            List<GameEntity> games = gameRepository.findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(
                playerWithoutGames.getId(), playerWithoutGames.getId()
            );

            // Assert
            assertThat(games)
                .isNotNull()
                .isEmpty();
        }
    }

    private UserEntity persistUser(String username, String email) {
        UserEntity user = UserEntity.builder()
            .username(username)
            .email(email)
            .password("Password123!")
            .role(UserRole.ROLE_USER)
            .build();
        entityManager.persist(user);
        entityManager.flush();
        return user;
    }

    private GameEntity persistGame(UserEntity white, UserEntity black, GameResult result, GameStatus status, LocalDateTime playedAt) {
        GameEntity game = GameEntity.builder()
            .whitePlayer(white)
            .blackPlayer(black)
            .result(result)
            .finishMethod(status)
            .pgnData("1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#")
            .playedAt(playedAt)
            .build();
        GameEntity saved = entityManager.merge(game);
        entityManager.flush();
        entityManager.clear();
        return saved;
    }
}
