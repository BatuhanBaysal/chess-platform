package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.user.ChangePasswordRequest;
import com.batuhan.chess.api.dto.user.DeleteAccountRequest;
import com.batuhan.chess.api.dto.user.UpdateProfileRequest;
import com.batuhan.chess.api.dto.user.UserResponseDTO;
import com.batuhan.chess.application.service.user.UserService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "User Management", description = "Authenticated user profile operations")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get current user profile")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        log.info("Fetching profile for current user");
        return ResponseEntity.ok(userService.getProfile());
    }

    @Operation(summary = "Update user profile")
    @PutMapping("/me")
    @RateLimiter(name = "profileUpdateLimiter")
    public ResponseEntity<Void> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        log.info("Updating profile for current user");
        userService.updateProfile(request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Change account password")
    @PutMapping("/me/password")
    @RateLimiter(name = "accountActionLimiter")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        log.info("Password change requested");
        userService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete account with password confirmation")
    @DeleteMapping("/me")
    @RateLimiter(name = "accountActionLimiter")
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
        log.warn("Account deletion requested by user");
        userService.deleteAccount(request);
        return ResponseEntity.noContent().build();
    }
}
