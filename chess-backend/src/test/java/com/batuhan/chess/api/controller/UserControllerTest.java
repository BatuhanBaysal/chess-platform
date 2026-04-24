package com.batuhan.chess.api.controller;

import com.batuhan.chess.application.service.auth.JwtService;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web layer unit tests for UserController.
 * Validates the retrieval of user profile statistics, Elo rating calculations,
 * and appropriate HTTP status code responses for user lookups.
 */
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("User Controller Web Layer Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtService jwtService;

    @Nested
    @DisplayName("User Statistics Retrieval")
    class UserStatsTests {

        @Test
        @DisplayName("Should return 200 OK and complete stats when a valid user ID is provided")
        void shouldReturnUserStatsSuccessfully() throws Exception {
            // Arrange
            Long userId = 1L;
            UserEntity user = UserEntity.builder()
                .id(userId)
                .username("batuhan")
                .eloRating(1500)
                .totalWins(10)
                .totalLosses(5)
                .totalDraws(2)
                .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            // Act & Assert
            mockMvc.perform(get("/api/users/{id}/stats", userId)
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("batuhan"))
                .andExpect(jsonPath("$.elo").value(1500))
                .andExpect(jsonPath("$.wins").value(10))
                .andExpect(jsonPath("$.losses").value(5))
                .andExpect(jsonPath("$.draws").value(2));

            verify(userRepository).findById(userId);
        }

        @Test
        @DisplayName("Should return 200 OK and default Elo rating (400) when user has no set rating")
        void shouldReturnDefaultEloWhenUserRatingIsNull() throws Exception {
            // Arrange
            Long userId = 2L;
            UserEntity user = UserEntity.builder()
                .id(userId)
                .username("new_player")
                .eloRating(null)
                .totalWins(0)
                .totalLosses(0)
                .totalDraws(0)
                .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            // Act & Assert
            mockMvc.perform(get("/api/users/{id}/stats", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.elo").value(400));
        }

        @Test
        @DisplayName("Should return 404 Not Found when searching for a non-existent user ID")
        void shouldReturnNotFoundWhenUserDoesNotExist() throws Exception {
            // Arrange
            Long userId = 99L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // Act & Assert
            mockMvc.perform(get("/api/users/{id}/stats", userId))
                .andExpect(status().isNotFound());
        }
    }
}
