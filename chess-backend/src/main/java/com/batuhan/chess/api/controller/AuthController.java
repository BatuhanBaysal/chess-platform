package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.api.dto.auth.RegisterRequest;
import com.batuhan.chess.application.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Secure user registration, authentication, and guest access endpoints.")
public class AuthController {

    private final AuthService authService;

    @Operation(
        summary = "Register new user",
        description = "Validates and registers a new user into the platform."
    )
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        log.info("AUTH_ACTION: Registration request received for identifier/email");
        authService.register(request);
        log.info("AUTH_ACTION: User successfully registered");
        return ResponseEntity.ok("User registered successfully");
    }

    @Operation(
        summary = "Authenticate user",
        description = "Authenticates user using username/email and password, returns JWT token."
    )
    @ApiResponse(responseCode = "200", description = "Authentication successful")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("AUTH_ACTION: Login attempt received");
        AuthResponse response = authService.login(request);
        log.info("AUTH_ACTION: User successfully authenticated");
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Login as guest",
        description = "Generates a temporary session token for guest access."
    )
    @ApiResponse(responseCode = "200", description = "Guest session initialized successfully")
    @PostMapping("/guest")
    public ResponseEntity<AuthResponse> loginAsGuest() {
        log.info("AUTH_ACTION: Guest session login requested");
        AuthResponse response = authService.loginAsGuest();
        log.info("AUTH_ACTION: Guest session successfully created");
        return ResponseEntity.ok(response);
    }
}
