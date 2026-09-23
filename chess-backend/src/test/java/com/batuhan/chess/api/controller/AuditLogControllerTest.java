package com.batuhan.chess.api.controller;

import com.batuhan.chess.AbstractIntegrationTest;
import com.batuhan.chess.api.dto.admin.AuditLogResponse;
import com.batuhan.chess.application.service.admin.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "ADMIN_USERNAME=admin",
    "ADMIN_EMAIL=admin@chess.com",
    "ADMIN_PASSWORD=Admin123!",
    "spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8081/realms/chess-realm",
    "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8081/realms/chess-realm/protocol/openid-connect/certs"
})
@DisplayName("Audit Log Controller Integration Tests")
class AuditLogControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        reset(auditLogService);
    }

    @Nested
    @DisplayName("GET /api/admin/audit-logs Tests")
    class GetAuditLogsTests {

        @Test
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
                    .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
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
        @DisplayName("Should return 403 Forbidden when non-admin user requests audit logs")
        void getAuditLogs_NonAdminUser_ReturnsForbidden() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/admin/audit-logs")
                    .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isForbidden());

            verify(auditLogService, never()).getAuditLogs(any(), any(), any());
        }

        @Test
        @DisplayName("Should return 401 Unauthorized when unauthenticated user requests audit logs")
        void getAuditLogs_UnauthenticatedUser_ReturnsUnauthorized() throws Exception {
            // Act & Assert
            mockMvc.perform(get("/api/admin/audit-logs")
                    .param("page", "0")
                    .param("size", "5"))
                .andExpect(status().isUnauthorized());

            verify(auditLogService, never()).getAuditLogs(any(), any(), any());
        }
    }
}
