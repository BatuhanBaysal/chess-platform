package com.batuhan.chess.api.dto.lobby;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CreateRoomRequest(
    @NotNull(message = "User ID cannot be null")
    Long userId,

    @NotBlank(message = "Username cannot be blank")
    String username,

    @Min(value = 1, message = "Time limit must be at least 1 minute")
    int time,

    @NotBlank(message = "Theme cannot be blank")
    String theme
) {}
