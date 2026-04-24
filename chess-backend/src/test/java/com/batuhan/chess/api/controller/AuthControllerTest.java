package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.api.dto.auth.RegisterRequest;
import com.batuhan.chess.application.service.auth.AuthService;
import com.batuhan.chess.application.service.auth.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web layer unit tests for AuthController.
 * Validates request mapping, JSON serialization/deserialization, and
 * the interaction between the web entry points and the AuthService.
 */
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Authentication Controller Web Layer Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @Nested
    @DisplayName("User Registration")
    class RegistrationTests {

        @Test
        @DisplayName("Should return 200 OK and success message when registration is valid")
        void shouldRegisterUserSuccessfully() throws Exception {
            // Arrange
            RegisterRequest request = new RegisterRequest("batuhan", "batuhan@chess.com", "Password123");
            doNothing().when(authService).register(any(RegisterRequest.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("User registered successfully"));

            verify(authService).register(any(RegisterRequest.class));
        }
    }

    @Nested
    @DisplayName("User Login Operations")
    class LoginTests {

        @Test
        @DisplayName("Should return JWT token and username upon successful login")
        void shouldLoginSuccessfully() throws Exception {
            // Arrange
            LoginRequest request = new LoginRequest("batuhan", "Password123");
            AuthResponse response = AuthResponse.builder()
                .token("mock-jwt-token")
                .username("batuhan")
                .build();

            when(authService.login(any(LoginRequest.class))).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("batuhan"));

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return guest token when logging in as a guest")
        void shouldLoginAsGuestSuccessfully() throws Exception {
            // Arrange
            AuthResponse response = AuthResponse.builder()
                .token("guest-token")
                .isGuest(true)
                .build();

            when(authService.loginAsGuest()).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/auth/guest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("guest-token"))
                .andExpect(jsonPath("$.isGuest").value(true));

            verify(authService).loginAsGuest();
        }
    }
}
