package com.batuhan.chess.api.dto.user;

import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(
    @NotBlank(message = "Password is required for account deletion")
    String password
) {}
