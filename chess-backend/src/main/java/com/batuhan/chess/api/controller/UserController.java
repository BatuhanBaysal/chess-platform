package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.dto.user.*;
import com.batuhan.chess.application.service.user.UserService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Authenticated user profile and account operations")
public class UserController {

    private final UserService userService;

    @Operation(
        summary = "Get current user profile",
        description = "Retrieves profile details of the currently authenticated user."
    )
    @ApiResponse(responseCode = "200", description = "User profile retrieved successfully")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        log.info("USER_ACTION: Request received to fetch current user profile");
        UserResponseDTO profile = userService.getProfile();
        log.info("USER_ACTION: Successfully retrieved profile");
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "Get global leaderboard top 3",
        description = "Retrieves top 3 users based on platform rankings."
    )
    @ApiResponse(responseCode = "200", description = "Top 3 leaderboard retrieved successfully")
    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserResponseDTO>> getLeaderboard() {
        log.info("USER_ACTION: Fetching global leaderboard top 3 users");
        List<UserResponseDTO> leaderboard = userService.getLeaderboard();
        log.info("USER_ACTION: Successfully retrieved top 3 users");
        return ResponseEntity.ok(leaderboard);
    }

    @Operation(
        summary = "Get global leaderboard all users",
        description = "Retrieves paginated leaderboard list of all users."
    )
    @ApiResponse(responseCode = "200", description = "Paginated leaderboard retrieved successfully")
    @GetMapping("/leaderboard/all")
    public ResponseEntity<List<UserResponseDTO>> getAllLeaderboard(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {

        log.info("USER_ACTION: Fetching paginated global leaderboard (Page: {}, Size: {})", page, size);
        List<UserResponseDTO> allLeaderboard = userService.getPagedLeaderboard(page, size);
        log.info("USER_ACTION: Successfully retrieved paginated leaderboard users");
        return ResponseEntity.ok(allLeaderboard);
    }

    @Operation(
        summary = "Update user profile",
        description = "Updates authenticated user's profile information."
    )
    @ApiResponse(responseCode = "204", description = "Profile updated successfully")
    @PutMapping("/me")
    @RateLimiter(name = "profileUpdateLimiter")
    public ResponseEntity<Void> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        log.info("USER_ACTION: Profile update requested");
        userService.updateProfile(request);
        log.info("USER_ACTION: Profile successfully updated");
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Change account password",
        description = "Updates password for the authenticated user after validating current credentials."
    )
    @ApiResponse(responseCode = "204", description = "Password changed successfully")
    @PutMapping("/me/password")
    @RateLimiter(name = "accountActionLimiter")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        log.info("USER_ACTION: Password change requested");
        userService.changePassword(request);
        log.info("USER_ACTION: Password successfully changed");
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Upload user avatar",
        description = "Uploads profile avatar image (PNG/JPEG, max 2MB) for authenticated user."
    )
    @ApiResponse(responseCode = "200", description = "Avatar uploaded successfully")
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RateLimiter(name = "profileUpdateLimiter")
    public ResponseEntity<AvatarUploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        log.info("USER_ACTION: Avatar upload initiated");
        AvatarUploadResponse response = userService.uploadAvatar(file);
        log.info("USER_ACTION: Avatar successfully uploaded");
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Get user avatar",
        description = "Retrieves the avatar image bytes for the requested username."
    )
    @ApiResponse(responseCode = "200", description = "Avatar retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Avatar not found")
    @GetMapping("/{username}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String username) {
        log.info("USER_ACTION: Fetching avatar for username: {}", username);
        FileDownloadDTO fileDownload = userService.getAvatar(username);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(fileDownload.contentType()))
            .body(fileDownload.data());
    }

    @Operation(
        summary = "Delete account with password confirmation",
        description = "Permanently deletes authenticated user account based on password confirmation."
    )
    @ApiResponse(responseCode = "204", description = "Account deleted successfully")
    @DeleteMapping("/me")
    @RateLimiter(name = "accountActionLimiter")
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
        log.warn("USER_ACTION: Account deletion requested by user");
        userService.deleteAccount(request);
        log.warn("USER_ACTION: User account successfully deleted");
        return ResponseEntity.noContent().build();
    }
}
