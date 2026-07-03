package com.batuhan.chess.api.dto.user;

import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(
    @NotBlank String password
) {}
