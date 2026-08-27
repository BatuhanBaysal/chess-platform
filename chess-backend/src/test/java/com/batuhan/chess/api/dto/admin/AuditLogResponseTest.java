package com.batuhan.chess.api.dto.admin;

import com.batuhan.chess.domain.model.admin.AuditLog;
import com.batuhan.chess.domain.model.user.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AuditLogResponse Unit Tests")
class AuditLogResponseTest {

    @Test
    @DisplayName("Should map AuditLog entity to AuditLogResponse correctly when admin is present")
    void shouldMapAuditLogEntitySuccessfully() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        UserEntity admin = UserEntity.builder()
            .id(1L)
            .username("super_admin")
            .build();

        AuditLog auditLog = AuditLog.builder()
            .id(100L)
            .admin(admin)
            .actionType("DELETE_USER")
            .details("Deleted user ID: 5")
            .createdAt(now)
            .build();

        // Act
        AuditLogResponse response = AuditLogResponse.fromEntity(auditLog);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.adminId()).isEqualTo(1L);
        assertThat(response.adminUsername()).isEqualTo("super_admin");
        assertThat(response.actionType()).isEqualTo("DELETE_USER");
        assertThat(response.details()).isEqualTo("Deleted user ID: 5");
        assertThat(response.createdAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should handle null admin gracefully when mapping AuditLog entity")
    void shouldHandleNullAdminWhenMappingEntity() {
        // Arrange
        AuditLog auditLog = AuditLog.builder()
            .id(101L)
            .admin(null)
            .actionType("SYSTEM_ACTION")
            .details("Automated maintenance task")
            .createdAt(LocalDateTime.now())
            .build();

        // Act
        AuditLogResponse response = AuditLogResponse.fromEntity(auditLog);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.adminId()).isNull();
        assertThat(response.adminUsername()).isEqualTo("Unknown");
        assertThat(response.actionType()).isEqualTo("SYSTEM_ACTION");
    }
}
