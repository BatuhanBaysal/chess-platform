package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.config.JwtAuthenticationFilter;
import com.batuhan.chess.api.dto.admin.AdminActiveGameResponseDTO;
import com.batuhan.chess.api.dto.admin.AdminUserResponseDTO;
import com.batuhan.chess.application.service.admin.AdminService;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.user.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = AdminController.class,
    excludeAutoConfiguration = {SecurityAutoConfiguration.class},
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = JwtAuthenticationFilter.class
    )
)
@DisplayName("Admin Controller Web Layer Tests")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private GameService gameService;

    @BeforeEach
    void setUp() {
        reset(adminService, gameService);
    }

    @Nested
    @DisplayName("GET /api/admin/users Tests")
    class GetAllUsersTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK with paginated users when admin requests")
        void getAllUsers_ValidRequest_ReturnsOk() throws Exception {
            // Arrange
            AdminUserResponseDTO userDTO = AdminUserResponseDTO.builder()
                .id(1L)
                .username("admin_test")
                .email("admin@test.com")
                .eloRating(1500)
                .role(UserRole.ROLE_ADMIN)
                .createdAt(LocalDateTime.now())
                .build();

            when(adminService.getAllUsers(any())).thenReturn(new PageImpl<>(List.of(userDTO), PageRequest.of(0, 10), 1));

            // Act & Assert
            mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("admin_test"));

            verify(adminService, times(1)).getAllUsers(any());
        }
    }

    @Nested
    @DisplayName("DELETE /api/admin/users/{id} Tests")
    class DeleteUserTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 204 No Content when deleting a user")
        void deleteUser_ValidRequest_ReturnsNoContent() throws Exception {
            // Arrange
            Long userId = 1L;
            doNothing().when(adminService).deleteUser(userId);

            // Act & Assert
            mockMvc.perform(delete("/api/admin/users/{id}", userId).with(csrf()))
                .andExpect(status().isNoContent());

            verify(adminService, times(1)).deleteUser(userId);
        }
    }

    @Nested
    @DisplayName("GET /api/admin/games/active Tests")
    class GetActiveGamesTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK with active games list")
        void getActiveGames_ValidRequest_ReturnsOk() throws Exception {
            // Arrange
            AdminActiveGameResponseDTO gameDTO = AdminActiveGameResponseDTO.builder()
                .gameId("game-123")
                .whitePlayerId(1L)
                .blackPlayerId(2L)
                .status(GameStatus.ACTIVE)
                .whiteRemainingTimeMs(300000L)
                .blackRemainingTimeMs(300000L)
                .build();

            when(adminService.getActiveGames()).thenReturn(List.of(gameDTO));

            // Act & Assert
            mockMvc.perform(get("/api/admin/games/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].gameId").value("game-123"));

            verify(adminService, times(1)).getActiveGames();
        }
    }

    @Nested
    @DisplayName("POST /api/admin/games/{gameId}/force-finish Tests")
    class ForceFinishGameTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 204 No Content when forcing game finish")
        void forceFinishGame_ValidRequest_ReturnsNoContent() throws Exception {
            // Arrange
            String gameId = "game-123";
            doNothing().when(adminService).forceFinishGame(gameId);

            // Act & Assert
            mockMvc.perform(post("/api/admin/games/{gameId}/force-finish", gameId).with(csrf()))
                .andExpect(status().isNoContent());

            verify(adminService, times(1)).forceFinishGame(gameId);
        }
    }

    @Nested
    @DisplayName("POST /api/admin/sandbox/trigger-game Tests")
    class TriggerSandboxGameTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 200 OK when triggering sandbox game")
        void triggerSandboxGame_ValidRequest_ReturnsOk() throws Exception {
            // Arrange
            Long whiteId = 1L;
            Long blackId = 2L;
            when(gameService.createGame(whiteId, blackId)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(post("/api/admin/sandbox/trigger-game")
                    .param("whiteId", String.valueOf(whiteId))
                    .param("blackId", String.valueOf(blackId))
                    .with(csrf()))
                .andExpect(status().isOk());

            verify(gameService, times(1)).createGame(whiteId, blackId);
        }
    }
}
