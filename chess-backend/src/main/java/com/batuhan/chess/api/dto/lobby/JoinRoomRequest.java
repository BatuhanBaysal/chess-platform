package com.batuhan.chess.api.dto.lobby;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record JoinRoomRequest(
    @NotBlank(message = "Room ID cannot be blank")
    String roomId,

    @NotNull(message = "User ID cannot be null")
    Long userId,

    @NotBlank(message = "Username cannot be blank")
    String username,

    @NotBlank(message = "Theme cannot be blank")
    String theme
) {}
