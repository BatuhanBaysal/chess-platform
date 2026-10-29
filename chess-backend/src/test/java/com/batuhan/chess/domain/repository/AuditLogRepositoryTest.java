package com.batuhan.chess.domain.repository;

import com.batuhan.chess.AbstractIntegrationTest;
import com.batuhan.chess.domain.model.admin.AuditLog;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("AuditLogRepository Integration Tests")
class AuditLogRepositoryTest extends AbstractIntegrationTest {

    private static final String ACTION_DELETE_USER = "DELETE_USER";
    private static final String ACTION_UPDATE_ROLE = "UPDATE_ROLE";

    @Autowired
    private AuditLogRepository auditLogRepository;

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
    @DisplayName("findWithFilters")
    class FindWithFiltersTests {

        @Test
        @DisplayName("Should return matching audit logs when both actionType and adminId match")
        void shouldReturnMatchingLogs_WhenBothFiltersMatch() {
            // Arrange
            UserEntity admin1 = persistUser("admin1", "admin1@chess.com");
            UserEntity admin2 = persistUser("admin2", "admin2@chess.com");

            persistAuditLog(admin1, ACTION_DELETE_USER, "Deleted user 1");
            persistAuditLog(admin1, ACTION_UPDATE_ROLE, "Updated role");
            persistAuditLog(admin2, ACTION_DELETE_USER, "Deleted user 2");

            Pageable pageable = PageRequest.of(0, 10);

            // Act
            Page<AuditLog> result = auditLogRepository.findWithFilters(ACTION_DELETE_USER, admin1.getId(), pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getActionType()).isEqualTo(ACTION_DELETE_USER);
            assertThat(result.getContent().get(0).getAdmin().getId()).isEqualTo(admin1.getId());
        }

        @Test
        @DisplayName("Should return logs filtered only by actionType when adminId is null")
        void shouldFilterOnlyByActionType_WhenAdminIdIsNull() {
            // Arrange
            UserEntity admin1 = persistUser("admin1", "admin1@chess.com");
            UserEntity admin2 = persistUser("admin2", "admin2@chess.com");

            persistAuditLog(admin1, ACTION_DELETE_USER, "Log 1");
            persistAuditLog(admin2, ACTION_DELETE_USER, "Log 2");
            persistAuditLog(admin1, ACTION_UPDATE_ROLE, "Log 3");

            // Act
            Page<AuditLog> result = auditLogRepository.findWithFilters(ACTION_DELETE_USER, null, PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent()).allMatch(log -> log.getActionType().equals(ACTION_DELETE_USER));
        }

        @Test
        @DisplayName("Should return logs filtered only by adminId when actionType is null")
        void shouldFilterOnlyByAdminId_WhenActionTypeIsNull() {
            // Arrange
            UserEntity admin1 = persistUser("admin1", "admin1@chess.com");
            UserEntity admin2 = persistUser("admin2", "admin2@chess.com");

            persistAuditLog(admin1, ACTION_DELETE_USER, "Log 1");
            persistAuditLog(admin1, ACTION_UPDATE_ROLE, "Log 2");
            persistAuditLog(admin2, ACTION_DELETE_USER, "Log 3");

            // Act
            Page<AuditLog> result = auditLogRepository.findWithFilters(null, admin1.getId(), PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent()).allMatch(log -> log.getAdmin().getId().equals(admin1.getId()));
        }

        @Test
        @DisplayName("Should return all audit logs when all filter parameters are null")
        void shouldReturnAllLogs_WhenAllFiltersAreNull() {
            // Arrange
            UserEntity admin = persistUser("adminUser", "adminuser@chess.com");
            persistAuditLog(admin, ACTION_DELETE_USER, "Details 1");
            persistAuditLog(admin, ACTION_UPDATE_ROLE, "Details 2");

            // Act
            Page<AuditLog> result = auditLogRepository.findWithFilters(null, null, PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should return empty page when no logs match specified criteria")
        void shouldReturnEmptyPage_WhenNoLogsMatchFilters() {
            // Arrange
            UserEntity admin = persistUser("adminUser", "adminuser@chess.com");
            persistAuditLog(admin, ACTION_UPDATE_ROLE, "Details");

            // Act
            Page<AuditLog> result = auditLogRepository.findWithFilters("NON_EXISTENT_ACTION", admin.getId(), PageRequest.of(0, 10));

            // Assert
            assertThat(result.getTotalElements()).isZero();
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should return correct page slice when pagination parameters are provided")
        void shouldReturnCorrectPageSlice_WhenPaginationIsApplied() {
            // Arrange
            UserEntity admin = persistUser("adminUser", "adminuser@chess.com");
            for (int i = 0; i < 5; i++) {
                persistAuditLog(admin, ACTION_DELETE_USER, "Detail " + i);
            }

            // Act
            Page<AuditLog> firstPage = auditLogRepository.findWithFilters(null, null, PageRequest.of(0, 2));
            Page<AuditLog> secondPage = auditLogRepository.findWithFilters(null, null, PageRequest.of(1, 2));

            // Assert
            assertThat(firstPage.getTotalElements()).isEqualTo(5);
            assertThat(firstPage.getContent()).hasSize(2);
            assertThat(secondPage.getContent()).hasSize(2);
            assertThat(firstPage.getTotalPages()).isEqualTo(3);
        }
    }

    private UserEntity persistUser(String username, String email) {
        UserEntity user = UserEntity.builder()
            .username(username)
            .email(email)
            .password("password123")
            .role(UserRole.ROLE_ADMIN)
            .build();
        entityManager.persist(user);
        entityManager.flush();
        return user;
    }

    private void persistAuditLog(UserEntity admin, String actionType, String details) {
        AuditLog log = AuditLog.builder()
            .admin(admin)
            .actionType(actionType)
            .details(details)
            .build();
        entityManager.persist(log);
        entityManager.flush();
    }
}
