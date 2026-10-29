package com.batuhan.chess.domain.repository;

import com.batuhan.chess.AbstractIntegrationTest;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("UserRepository Integration Tests")
class UserRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired(required = false)
    private CacheManager cacheManager;

    @SuppressWarnings("SqlNoDataSourceInspection")
    @BeforeEach
    void setUp() {
        if (cacheManager != null) {
            cacheManager.getCacheNames().forEach(name -> {
                var cache = cacheManager.getCache(name);
                if (cache != null) {
                    cache.clear();
                }
            });
        }
        entityManager.createNativeQuery("TRUNCATE TABLE audit_logs, games, users CASCADE").executeUpdate();
        entityManager.flush();
        entityManager.clear();
    }

    @Nested
    @DisplayName("Single Entity Inquiries")
    class SingleEntityInquiriesTests {

        @Test
        @DisplayName("Should return active user when matching username is active")
        void shouldReturnActiveUser_WhenUsernameMatchesAndActive() {
            // Arrange
            persistUser("batuhan", "batuhan@chess.com", true, 1500, UserRole.ROLE_USER, false);

            // Act
            Optional<UserEntity> found = userRepository.findByUsernameAndActiveTrue("batuhan");

            // Assert
            assertThat(found).isPresent();
            assertThat(found.get().getUsername()).isEqualTo("batuhan");
        }

        @Test
        @DisplayName("Should return empty Optional when user is inactive or does not exist")
        void shouldReturnEmptyOptional_WhenUserIsInactiveOrNonExistent() {
            // Arrange
            persistUser("inactive", "inactive@chess.com", false, 1200, UserRole.ROLE_USER, false);

            // Act
            Optional<UserEntity> inactiveResult = userRepository.findByUsernameAndActiveTrue("inactive");
            Optional<UserEntity> nonExistent = userRepository.findByUsernameAndActiveTrue("nonexistent");

            // Assert
            assertThat(inactiveResult).isNotPresent();
            assertThat(nonExistent).isNotPresent();
        }

        @Test
        @DisplayName("Should return user regardless of active state when using findByUsername")
        void shouldReturnUser_RegardlessOfActiveStatus_WhenUsingFindByUsername() {
            // Arrange
            persistUser("dormantUser", "dormant@chess.com", false, 1200, UserRole.ROLE_USER, false);

            // Act
            Optional<UserEntity> found = userRepository.findByUsername("dormantUser");
            Optional<UserEntity> missing = userRepository.findByUsername("unknown");

            // Assert
            assertThat(found).isPresent();
            assertThat(found.get().isActive()).isFalse();
            assertThat(missing).isNotPresent();
        }

        @Test
        @DisplayName("Should return user by email when active or empty if inactive/nonexistent")
        void shouldReturnUserByEmail_WhenActiveOrEmptyOtherwise() {
            // Arrange
            persistUser("activeUser", "active@chess.com", true, 1500, UserRole.ROLE_USER, false);
            persistUser("passiveUser", "passive@chess.com", false, 1500, UserRole.ROLE_USER, false);

            // Act
            Optional<UserEntity> found = userRepository.findByEmailAndActiveTrue("active@chess.com");
            Optional<UserEntity> passive = userRepository.findByEmailAndActiveTrue("passive@chess.com");
            Optional<UserEntity> nonExistent = userRepository.findByEmailAndActiveTrue("missing@chess.com");

            // Assert
            assertThat(found).isPresent();
            assertThat(passive).isNotPresent();
            assertThat(nonExistent).isNotPresent();
        }

        @Test
        @DisplayName("Should return correct booleans for username and email existence checks")
        void shouldReturnCorrectBooleans_ForExistenceChecks() {
            // Arrange
            persistUser("existingUser", "existing@chess.com", true, 1200, UserRole.ROLE_USER, false);

            // Act & Assert
            assertThat(userRepository.existsByUsername("existingUser")).isTrue();
            assertThat(userRepository.existsByUsername("unknownUser")).isFalse();

            assertThat(userRepository.existsByEmail("existing@chess.com")).isTrue();
            assertThat(userRepository.existsByEmail("unknown@chess.com")).isFalse();
        }
    }

    @Nested
    @DisplayName("Paged Listings & Filtering")
    class PagedListingsTests {

        @Test
        @DisplayName("Should return only active users when findAllByActiveTrue is invoked")
        void shouldReturnOnlyActiveUsers_WhenFindAllByActiveTrueIsInvoked() {
            // Arrange
            persistUser("active1", "a1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("active2", "a2@chess.com", true, 1300, UserRole.ROLE_USER, false);
            persistUser("inactive", "in@chess.com", false, 1400, UserRole.ROLE_USER, false);

            // Act
            Page<UserEntity> page = userRepository.findAllByActiveTrue(PageRequest.of(0, 10));

            // Assert
            assertThat(page.getTotalElements()).isEqualTo(2);
            assertThat(page.getContent()).extracting(UserEntity::getUsername)
                .containsExactlyInAnyOrder("active1", "active2");
        }

        @Test
        @DisplayName("Should exclude guest accounts when findAllActiveMembers is invoked")
        void shouldExcludeGuests_WhenFindAllActiveMembersIsInvoked() {
            // Arrange
            persistUser("member1", "m1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("guest1", "g1@chess.com", true, 1200, UserRole.ROLE_GUEST, true);
            persistUser("inactiveMember", "in@chess.com", false, 1200, UserRole.ROLE_USER, false);

            // Act
            Page<UserEntity> members = userRepository.findAllActiveMembers(PageRequest.of(0, 10));

            // Assert
            assertThat(members.getTotalElements()).isEqualTo(1);
            assertThat(members.getContent().get(0).getUsername()).isEqualTo("member1");
        }

        @Test
        @DisplayName("Should return only active guest accounts when findAllActiveGuests is invoked")
        void shouldReturnOnlyGuests_WhenFindAllActiveGuestsIsInvoked() {
            // Arrange
            persistUser("member1", "m1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("guest1", "g1@chess.com", true, 1200, UserRole.ROLE_GUEST, true);
            persistUser("inactiveGuest", "ig@chess.com", false, 1200, UserRole.ROLE_GUEST, true);

            // Act
            Page<UserEntity> guests = userRepository.findAllActiveGuests(PageRequest.of(0, 10));

            // Assert
            assertThat(guests.getTotalElements()).isEqualTo(1);
            assertThat(guests.getContent().get(0).getUsername()).isEqualTo("guest1");
        }

        @Test
        @DisplayName("Should return active users ordered by Elo rating descending")
        void shouldReturnUsersSortedByEloDescending_WhenRequested() {
            // Arrange
            persistUser("bronze", "bronze@chess.com", true, 1000, UserRole.ROLE_USER, false);
            persistUser("grandmaster", "gm@chess.com", true, 2500, UserRole.ROLE_USER, false);
            persistUser("inactiveGm", "igm@chess.com", false, 3000, UserRole.ROLE_USER, false);

            // Act
            Page<UserEntity> result = userRepository.findAllByActiveTrueOrderByEloRatingDesc(PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent().get(0).getUsername()).isEqualTo("grandmaster");
            assertThat(result.getContent().get(1).getUsername()).isEqualTo("bronze");
        }

        @Test
        @DisplayName("Should return limited top players sorted by Elo rating")
        void shouldReturnTopPlayers_WhenLimitedSliceIsRequested() {
            // Arrange
            persistUser("player1", "p1@chess.com", true, 1100, UserRole.ROLE_USER, false);
            persistUser("player2", "p2@chess.com", true, 1900, UserRole.ROLE_USER, false);
            persistUser("player3", "p3@chess.com", true, 1500, UserRole.ROLE_USER, false);

            // Act
            List<UserEntity> topUsers = userRepository.findTop3ByOrderByEloRatingDesc(PageRequest.of(0, 2));

            // Assert
            assertThat(topUsers).hasSize(2);
            assertThat(topUsers.get(0).getEloRating()).isEqualTo(1900);
            assertThat(topUsers.get(1).getEloRating()).isEqualTo(1500);
        }
    }

    @Nested
    @DisplayName("findUsersWithFilterAndSearch")
    class FindUsersWithFilterAndSearchTests {

        @Test
        @DisplayName("Should return all active accounts when filter is 'all' and search term is empty")
        void shouldReturnAllActive_WhenFilterIsAllAndSearchIsEmpty() {
            // Arrange
            persistUser("member1", "member1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("guest_1", "guest1@chess.com", true, 1200, UserRole.ROLE_GUEST, true);
            persistUser("inactive", "inactive@chess.com", false, 1200, UserRole.ROLE_USER, false);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("all", null, PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent()).extracting(UserEntity::getUsername)
                .containsExactlyInAnyOrder("member1", "guest_1");
        }

        @Test
        @DisplayName("Should return only active registered members when filter is 'members'")
        void shouldReturnOnlyMembers_WhenFilterIsMembers() {
            // Arrange
            persistUser("member1", "member1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("guest_1", "guest1@chess.com", true, 1200, UserRole.ROLE_GUEST, true);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("members", null, PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getUsername()).isEqualTo("member1");
        }

        @Test
        @DisplayName("Should return only active guest accounts when filter is 'guests'")
        void shouldReturnOnlyGuests_WhenFilterIsGuests() {
            // Arrange
            persistUser("member1", "member1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("guest_1", "guest1@chess.com", true, 1200, UserRole.ROLE_GUEST, true);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("guests", null, PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getUsername()).isEqualTo("guest_1");
        }

        @Test
        @DisplayName("Should match case-insensitively across username and email fields")
        void shouldMatchCaseInsensitively_AcrossUsernameAndEmail() {
            // Arrange
            persistUser("batuhan", "batu@example.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("ahmet", "batuhan_fan@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("mehmet", "mehmet@chess.com", true, 1200, UserRole.ROLE_USER, false);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("all", "BATU", PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent()).extracting(UserEntity::getUsername)
                .containsExactlyInAnyOrder("batuhan", "ahmet");
        }

        @Test
        @DisplayName("Should return empty page when search term does not match any user")
        void shouldReturnEmptyPage_WhenSearchTermHasNoMatch() {
            // Arrange
            persistUser("batuhan", "batu@example.com", true, 1200, UserRole.ROLE_USER, false);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("all", "NO_MATCH", PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isZero();
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("findUsersWithFilterAndSearch - Edge Cases")
    class FilterAndSearchEdgeCasesTests {

        @Test
        @DisplayName("Should return active users when search parameter is an empty string")
        void shouldReturnActiveUsers_WhenSearchIsEmptyString() {
            // Arrange
            persistUser("member1", "member1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            Pageable pageable = PageRequest.of(0, 10);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("all", "", pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getUsername()).isEqualTo("member1");
        }

        @Test
        @DisplayName("Should filter members only while respecting search term")
        void shouldFilterMembers_WithSearchTerm() {
            // Arrange
            persistUser("batu_member", "batu1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("batu_guest", "batu2@chess.com", true, 1200, UserRole.ROLE_GUEST, true);
            Pageable pageable = PageRequest.of(0, 10);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("members", "batu", pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getUsername()).isEqualTo("batu_member");
        }

        @Test
        @DisplayName("Should exclude inactive users even if they match search term")
        void shouldExcludeInactiveUsers_EvenIfSearchMatches() {
            // Arrange
            persistUser("target_active", "target1@chess.com", true, 1200, UserRole.ROLE_USER, false);
            persistUser("target_inactive", "target2@chess.com", false, 1200, UserRole.ROLE_USER, false);
            Pageable pageable = PageRequest.of(0, 10);

            // Act
            Page<UserEntity> result = userRepository.findUsersWithFilterAndSearch("all", "target", pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getUsername()).isEqualTo("target_active");
        }

        @Test
        @DisplayName("Should include member when user is not a guest")
        void shouldIncludeMember_WhenUserIsNotGuest() {
            // Arrange
            persistUser("standard_member", "member@chess.com", true, 1200, UserRole.ROLE_USER, false);
            Pageable pageable = PageRequest.of(0, 10);

            // Act
            Page<UserEntity> result = userRepository.findAllActiveMembers(pageable);

            // Assert
            assertThat(result)
                .isNotNull()
                .isNotEmpty();
            assertThat(result.getContent().get(0).getUsername()).isEqualTo("standard_member");
        }
    }

    private void persistUser(String username, String email, boolean active, int elo, UserRole role, Boolean isGuest) {
        UserEntity user = UserEntity.builder()
            .username(username)
            .email(email)
            .password("Password123!")
            .role(role)
            .isGuest(Boolean.TRUE.equals(isGuest))
            .active(active)
            .eloRating(elo)
            .build();
        entityManager.persist(user);
        entityManager.flush();
        entityManager.clear();
    }
}
