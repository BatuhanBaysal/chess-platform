package com.batuhan.chess.domain.repository;

import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("UserRepository Data JPA Tests")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should find active user by username")
    void findByUsernameAndActiveTrue_ReturnsActiveUser() {
        // Arrange
        persistUser("batuhan", "batuhan@chess.com", true, 1500);
        persistUser("inactive", "inactive@chess.com", false, 1200);

        // Act
        Optional<UserEntity> found = userRepository.findByUsernameAndActiveTrue("batuhan");
        Optional<UserEntity> notFound = userRepository.findByUsernameAndActiveTrue("inactive");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("batuhan");
        assertThat(notFound).isNotPresent();
    }

    @Test
    @DisplayName("Should find active user by email")
    void findByEmailAndActiveTrue_ReturnsActiveUser() {
        // Arrange
        persistUser("batuhan", "batuhan@chess.com", true, 1500);

        // Act
        Optional<UserEntity> found = userRepository.findByEmailAndActiveTrue("batuhan@chess.com");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("batuhan@chess.com");
    }

    @Test
    @DisplayName("Should correctly check existence by username and email")
    void existsChecks_ReturnCorrectBooleans() {
        // Arrange
        persistUser("batuhan", "batuhan@chess.com", true, 1200);

        // Act & Assert
        assertThat(userRepository.existsByUsername("batuhan")).isTrue();
        assertThat(userRepository.existsByUsername("nonexistent")).isFalse();

        assertThat(userRepository.existsByEmail("batuhan@chess.com")).isTrue();
        assertThat(userRepository.existsByEmail("other@chess.com")).isFalse();
    }

    @Test
    @DisplayName("Should return active users ordered by Elo rating descending in a page")
    void findAllByActiveTrueOrderByEloRatingDesc_ReturnsPagedUsers() {
        // Arrange
        persistUser("user1", "user1@chess.com", true, 1000);
        persistUser("user2", "user2@chess.com", true, 2000);
        persistUser("user3", "user3@chess.com", false, 3000); // Inactive

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<UserEntity> result = userRepository.findAllByActiveTrueOrderByEloRatingDesc(pageable);

        // Assert
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent().get(0).getUsername()).isEqualTo("user2");
        assertThat(result.getContent().get(1).getUsername()).isEqualTo("user1");
    }

    @Test
    @DisplayName("Should return top users ordered by Elo rating")
    void findTop3ByOrderByEloRatingDesc_ReturnsLimitedTopUsers() {
        // Arrange
        persistUser("user1", "user1@chess.com", true, 1100);
        persistUser("user2", "user2@chess.com", true, 1900);
        persistUser("user3", "user3@chess.com", true, 1500);

        Pageable pageable = PageRequest.of(0, 2);

        // Act
        List<UserEntity> topUsers = userRepository.findTop3ByOrderByEloRatingDesc(pageable);

        // Assert
        assertThat(topUsers).hasSize(2);
        assertThat(topUsers.get(0).getEloRating()).isEqualTo(1900);
        assertThat(topUsers.get(1).getEloRating()).isEqualTo(1500);
    }

    private void persistUser(String username, String email, boolean active, int elo) {
        UserEntity user = UserEntity.builder()
            .username(username)
            .email(email)
            .password("Password123!")
            .role(UserRole.ROLE_USER)
            .active(active)
            .eloRating(elo)
            .build();
        entityManager.persistAndFlush(user);
    }
}
