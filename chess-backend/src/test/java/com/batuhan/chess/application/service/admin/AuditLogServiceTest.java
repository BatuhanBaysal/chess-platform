package com.batuhan.chess.application.service.admin;

import com.batuhan.chess.api.dto.admin.AuditLogResponse;
import com.batuhan.chess.domain.model.admin.AuditLog;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.AuditLogRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditLogService Unit Tests")
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    @Nested
    @DisplayName("logAction Tests")
    class LogActionTests {

        @Test
        @DisplayName("Should successfully log action when admin user exists")
        void logAction_ValidAdmin_SavesAuditLog() {
            // Arrange
            Long adminId = 1L;
            String actionType = "DELETE_USER";
            String details = "Deleted user with id 5";

            UserEntity adminUser = new UserEntity();
            adminUser.setId(adminId);
            adminUser.setUsername("adminUser");

            when(userRepository.findById(adminId)).thenReturn(Optional.of(adminUser));

            // Act
            auditLogService.logAction(adminId, actionType, details);

            // Assert
            ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
            verify(userRepository, times(1)).findById(adminId);
            verify(auditLogRepository, times(1)).save(logCaptor.capture());

            AuditLog savedLog = logCaptor.getValue();
            assertThat(savedLog.getAdmin()).isEqualTo(adminUser);
            assertThat(savedLog.getActionType()).isEqualTo(actionType);
            assertThat(savedLog.getDetails()).isEqualTo(details);
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when admin user not found")
        void logAction_AdminNotFound_ThrowsException() {
            // Arrange
            Long adminId = 99L;
            when(userRepository.findById(adminId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> auditLogService.logAction(adminId, "ANY_ACTION", "Details"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Admin user not found with id: " + adminId);

            verify(userRepository, times(1)).findById(adminId);
            verify(auditLogRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getAuditLogs Tests")
    class GetAuditLogsTests {

        @Test
        @DisplayName("Should return mapped audit log responses when filters applied")
        void getAuditLogs_WithFilters_ReturnsMappedPage() {
            // Arrange
            String actionType = "DELETE_USER";
            Long adminId = 1L;
            Pageable pageable = PageRequest.of(0, 10);

            UserEntity adminUser = new UserEntity();
            adminUser.setId(adminId);
            adminUser.setUsername("adminUser");

            AuditLog auditLog = AuditLog.builder()
                .id(10L)
                .admin(adminUser)
                .actionType(actionType)
                .details("Test details")
                .createdAt(LocalDateTime.now())
                .build();

            Page<AuditLog> logPage = new PageImpl<>(List.of(auditLog), pageable, 1);

            when(auditLogRepository.findWithFilters(actionType, adminId, pageable)).thenReturn(logPage);

            // Act
            Page<AuditLogResponse> result = auditLogService.getAuditLogs(actionType, adminId, pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent()).hasSize(1);

            AuditLogResponse response = result.getContent().get(0);
            assertThat(response.id()).isEqualTo(10L);
            assertThat(response.actionType()).isEqualTo(actionType);
            assertThat(response.adminUsername()).isEqualTo("adminUser");

            verify(auditLogRepository, times(1)).findWithFilters(actionType, adminId, pageable);
        }
    }
}
