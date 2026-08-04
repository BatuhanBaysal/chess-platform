package com.batuhan.chess.domain.repository;

import com.batuhan.chess.domain.model.admin.AuditLog;
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

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("AuditLogRepository Data JPA Tests")
class AuditLogRepositoryTest {

    private static final String ACTION_DELETE_USER = "DELETE_USER";
    private static final String ACTION_UPDATE_ROLE = "UPDATE_ROLE";

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should return filtered audit logs when actionType and adminId are provided")
    void findWithFilters_WithBothFilters_ReturnsMatchingLogs() {
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
    @DisplayName("Should return all audit logs when filters are null")
    void findWithFilters_WithNullFilters_ReturnsAllLogs() {
        // Arrange
        UserEntity admin = persistUser("adminUser", "adminuser@chess.com");

        persistAuditLog(admin, ACTION_DELETE_USER, "Details 1");
        persistAuditLog(admin, "UPDATE_USER", "Details 2");

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<AuditLog> result = auditLogRepository.findWithFilters(null, null, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    private UserEntity persistUser(String username, String email) {
        UserEntity user = UserEntity.builder()
            .username(username)
            .email(email)
            .password("password123")
            .role(UserRole.ROLE_ADMIN)
            .build();
        return entityManager.persistAndFlush(user);
    }

    private void persistAuditLog(UserEntity admin, String actionType, String details) {
        AuditLog log = AuditLog.builder()
            .admin(admin)
            .actionType(actionType)
            .details(details)
            .build();
        entityManager.persistAndFlush(log);
    }
}
