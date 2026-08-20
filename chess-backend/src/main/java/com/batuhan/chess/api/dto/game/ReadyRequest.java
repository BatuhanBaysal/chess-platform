package com.batuhan.chess.api.dto.game;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record ReadyRequest(
    @NotBlank(message = "Game ID cannot be blank")
    String gameId,

    @NotNull(message = "User ID cannot be null")
    Long userId
) {}
