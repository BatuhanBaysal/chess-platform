package com.batuhan.chess.api.dto.game;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HeartbeatRequest(
    @NotBlank(message = "Game ID cannot be empty") String gameId,
    @NotNull(message = "User ID is required") Long userId
) {}
