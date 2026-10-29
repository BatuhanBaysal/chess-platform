package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.dto.user.*;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.application.service.user.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = UserController.class,
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class,
        OAuth2ResourceServerAutoConfiguration.class
    }
)
@DisplayName("User Controller Web Layer Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public RateLimiterRegistry rateLimiterRegistry() {
            return RateLimiterRegistry.of(RateLimiterConfig.custom().build());
        }
    }

    @BeforeEach
    void setUp() {
        reset(userService);
    }

    @Nested
    @DisplayName("Profile Retrieval Tests")
    class GetProfileTests {

        @Test
        @WithMockUser
        @DisplayName("Should return 200 OK when fetching current user profile")
        void getMyProfile_ValidRequest_ReturnsOk() throws Exception {
            // Arrange
            UserResponseDTO mockResponse = UserResponseDTO.builder().username("batuhan").build();
            when(userService.getProfile()).thenReturn(mockResponse);

            // Act
            ResultActions result = mockMvc.perform(get("/api/users/me"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("batuhan"));
        }
    }

    @Nested
    @DisplayName("Leaderboard Tests")
    class LeaderboardTests {

        @Test
        @WithMockUser
        @DisplayName("Should return 200 OK with top 3 leaderboard users")
        void getLeaderboard_ReturnsTopThreeUsers() throws Exception {
            // Arrange
            UserResponseDTO user1 = UserResponseDTO.builder().username("player1").eloRating(2000).build();
            UserResponseDTO user2 = UserResponseDTO.builder().username("player2").eloRating(1900).build();
            when(userService.getLeaderboard()).thenReturn(List.of(user1, user2));

            // Act
            ResultActions result = mockMvc.perform(get("/api/users/leaderboard"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("player1"))
                .andExpect(jsonPath("$[1].username").value("player2"));

            verify(userService, times(1)).getLeaderboard();
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 200 OK with paginated leaderboard response")
        void getAllLeaderboard_ValidRequest_ReturnsPageResponse() throws Exception {
            // Arrange
            UserResponseDTO user = UserResponseDTO.builder()
                .username("batuhan")
                .eloRating(1200)
                .build();
            org.springframework.data.domain.Page<UserResponseDTO> page =
                new org.springframework.data.domain.PageImpl<>(List.of(user));

            when(userService.getPagedLeaderboard(0, 10)).thenReturn(page);

            // Act
            ResultActions result = mockMvc.perform(get("/api/users/leaderboard/all")
                .param("page", "0")
                .param("size", "10"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("batuhan"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

            verify(userService, times(1)).getPagedLeaderboard(0, 10);
        }
    }

    @Nested
    @DisplayName("Profile Update Tests")
    class UpdateProfileTests {

        @Test
        @WithMockUser
        @DisplayName("Should return 204 No Content when profile update is valid")
        void updateProfile_ValidRequest_ReturnsNoContent() throws Exception {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("new_batuhan", "new@mail.com");
            doNothing().when(userService).updateProfile(any(UpdateProfileRequest.class));

            // Act
            ResultActions result = mockMvc.perform(put("/api/users/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isNoContent());
            verify(userService, times(1)).updateProfile(any(UpdateProfileRequest.class));
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 400 Bad Request when validation fails")
        void updateProfile_InvalidRequest_ReturnsBadRequest() throws Exception {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("hi", "invalid-email");

            // Act
            ResultActions result = mockMvc.perform(put("/api/users/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 409 Conflict when username is already taken")
        void updateProfile_DuplicateUsername_ReturnsConflict() throws Exception {
            // Arrange
            UpdateProfileRequest request = new UpdateProfileRequest("existingUser", "test@mail.com");
            doThrow(new UserAlreadyExistsException("Already exists"))
                .when(userService).updateProfile(any(UpdateProfileRequest.class));

            // Act
            ResultActions result = mockMvc.perform(put("/api/users/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("Password Change Tests")
    class ChangePasswordTests {

        @Test
        @WithMockUser
        @DisplayName("Should return 204 No Content when password change is valid")
        void changePassword_ValidRequest_ReturnsNoContent() throws Exception {
            // Arrange
            ChangePasswordRequest request = new ChangePasswordRequest("oldPass123", "newPass123");

            // Act
            ResultActions result = mockMvc.perform(put("/api/users/me/password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isNoContent());
            verify(userService, times(1)).changePassword(any(ChangePasswordRequest.class));
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 400 Bad Request when new password is too weak")
        void changePassword_WeakPassword_ReturnsBadRequest() throws Exception {
            // Arrange
            ChangePasswordRequest request = new ChangePasswordRequest("oldPass123", "123");

            // Act
            ResultActions result = mockMvc.perform(put("/api/users/me/password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Avatar Operations Tests")
    class AvatarControllerTests {

        @Test
        @WithMockUser
        @DisplayName("Should return 200 OK when avatar is uploaded successfully")
        void uploadAvatar_ValidFile_ReturnsOk() throws Exception {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", MediaType.IMAGE_PNG_VALUE, "dummy image bytes".getBytes()
            );
            AvatarUploadResponse mockResponse = new AvatarUploadResponse("/api/users/batuhan/avatar", "Avatar uploaded successfully");
            when(userService.uploadAvatar(any(MultipartFile.class))).thenReturn(mockResponse);

            // Act
            ResultActions result = mockMvc.perform(multipart("/api/users/me/avatar")
                .file(file)
                .with(csrf()));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("/api/users/batuhan/avatar"))
                .andExpect(jsonPath("$.message").value("Avatar uploaded successfully"));

            verify(userService, times(1)).uploadAvatar(any(MultipartFile.class));
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 204 No Content when avatar is deleted successfully")
        void deleteAvatar_ReturnsNoContent() throws Exception {
            // Arrange
            doNothing().when(userService).deleteAvatar();

            // Act
            ResultActions result = mockMvc.perform(delete("/api/users/me/avatar").with(csrf()));

            // Assert
            result.andExpect(status().isNoContent());
            verify(userService, times(1)).deleteAvatar();
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 200 OK and image bytes when avatar exists")
        void getAvatar_UserExists_ReturnsImageBytes() throws Exception {
            // Arrange
            byte[] imageBytes = "image-byte-data".getBytes();
            FileDownloadDTO downloadDTO = new FileDownloadDTO(imageBytes, MediaType.IMAGE_PNG_VALUE, "batuhan.png");
            when(userService.getAvatar("batuhan")).thenReturn(downloadDTO);

            // Act
            ResultActions result = mockMvc.perform(get("/api/users/{username}/avatar", "batuhan"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG_VALUE))
                .andExpect(content().bytes(imageBytes));

            verify(userService, times(1)).getAvatar("batuhan");
        }
    }

    @Nested
    @DisplayName("Account Deletion Tests")
    class DeleteAccountTests {

        @Test
        @WithMockUser
        @DisplayName("Should return 204 No Content when password confirmation is correct")
        void deleteAccount_ValidRequest_ReturnsNoContent() throws Exception {
            // Arrange
            DeleteAccountRequest request = new DeleteAccountRequest("password123");

            // Act
            ResultActions result = mockMvc.perform(delete("/api/users/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isNoContent());
            verify(userService, times(1)).deleteAccount(any(DeleteAccountRequest.class));
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 400 Bad Request when password field is blank")
        void deleteAccount_BlankPassword_ReturnsBadRequest() throws Exception {
            // Arrange
            DeleteAccountRequest request = new DeleteAccountRequest("");

            // Act
            ResultActions result = mockMvc.perform(delete("/api/users/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isBadRequest());
        }
    }
}
