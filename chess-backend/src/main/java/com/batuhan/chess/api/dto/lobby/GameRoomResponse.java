package com.batuhan.chess.api.dto.lobby;

import lombok.Builder;

@Builder
public record GameRoomResponse(
    String roomId,
    Long hostId,
    String hostName,
    Long blackPlayerId,
    String blackPlayerName,
    String status,
    int timeLimit,
    String theme
) {}
