package com.batuhan.chess.api.dto.game;

public record HeartbeatRequest(
    String gameId,
    Long userId
) {}
