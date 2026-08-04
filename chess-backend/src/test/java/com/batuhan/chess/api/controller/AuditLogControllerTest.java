package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.config.TestConfig;
import com.batuhan.chess.api.dto.admin.AuditLogResponse;
import com.batuhan.chess.application.service.admin.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
@DisplayName("Audit Log Controller Integration Tests")
class AuditLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuditLogService auditLogService;

    @MockitoBean
    private RedisConnectionFactory redisConnectionFactory;

    @BeforeEach
    void setUp() {
        reset(auditLogService);
    }

    @Nested
    @DisplayName("GET /api/admin/audit-logs Tests")
    class GetAuditLogsTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK with paginated audit logs when admin requests")
        void getAuditLogs_ValidRequest_ReturnsOk() throws Exception {
            // Arrange
            AuditLogResponse logResponse = new AuditLogResponse(
                1L,
                100L,
                "adminUser",
                "DELETE_USER",
                "User deleted ID: 5",
                LocalDateTime.now()
            );

            when(auditLogService.getAuditLogs(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(logResponse), PageRequest.of(0, 10), 1));

            // Act & Assert
            mockMvc.perform(get("/api/admin/audit-logs")
                    .param("page", "0")
                    .param("size", "10")
                    .param("actionType", "DELETE_USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].actionType").value("DELETE_USER"))
                .andExpect(jsonPath("$.content[0].adminUsername").value("adminUser"))
                .andExpect(jsonPath("$.totalElements").value(1));

            verify(auditLogService, times(1)).getAuditLogs(any(), any(), any(Pageable.class));
        }

        @Test
        @WithMockUser(roles = "USER")
        @DisplayName("Should return 403 Forbidden when non-admin user requests audit logs")
        void getAuditLogs_NonAdminUser_ReturnsForbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/admin/audit-logs"))
                .andExpect(status().isForbidden());

            verify(auditLogService, never()).getAuditLogs(any(), any(), any());
        }

        @Test
        @DisplayName("Should return 403 Forbidden when unauthenticated user requests audit logs with parameters")
        void getAuditLogs_UnauthenticatedUser_ReturnsForbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/admin/audit-logs")
                    .param("page", "0")
                    .param("size", "5"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$").doesNotExist());

            verify(auditLogService, never()).getAuditLogs(any(), any(), any());
        }
    }
}
