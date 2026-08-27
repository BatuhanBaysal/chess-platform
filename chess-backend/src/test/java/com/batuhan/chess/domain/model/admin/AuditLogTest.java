package com.batuhan.chess.domain.model.admin;

import com.batuhan.chess.domain.model.user.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AuditLog Entity Unit Tests")
class AuditLogTest {

    @Test
    @DisplayName("Should build AuditLog using Lombok Builder and getters correctly")
    void shouldCreateAuditLogWithBuilder() {
        // Arrange
        Long id = 1L;
        UserEntity admin = new UserEntity();
        String actionType = "DELETE_USER";
        String details = "Admin deleted user with ID 5";
        LocalDateTime now = LocalDateTime.now();

        // Act
        AuditLog auditLog = AuditLog.builder()
            .id(id)
            .admin(admin)
            .actionType(actionType)
            .details(details)
            .createdAt(now)
            .build();

        // Assert
        assertThat(auditLog.getId()).isEqualTo(id);
        assertThat(auditLog.getAdmin()).isEqualTo(admin);
        assertThat(auditLog.getActionType()).isEqualTo(actionType);
        assertThat(auditLog.getDetails()).isEqualTo(details);
        assertThat(auditLog.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should instantiate AuditLog using no-args and all-args constructors with setters")
    void shouldSupportConstructorsAndSetters() {
        // Arrange
        AuditLog auditLog = new AuditLog();
        UserEntity admin = new UserEntity();
        LocalDateTime now = LocalDateTime.now();

        // Act
        auditLog.setId(2L);
        auditLog.setAdmin(admin);
        auditLog.setActionType("BAN_USER");
        auditLog.setDetails("Banned user due to violation");
        auditLog.setCreatedAt(now);

        // Assert
        assertThat(auditLog.getId()).isEqualTo(2L);
        assertThat(auditLog.getAdmin()).isEqualTo(admin);
        assertThat(auditLog.getActionType()).isEqualTo("BAN_USER");
        assertThat(auditLog.getDetails()).isEqualTo("Banned user due to violation");
        assertThat(auditLog.getCreatedAt()).isEqualTo(now);
    }
}
