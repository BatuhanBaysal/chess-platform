package com.batuhan.chess.api.dto.game;

public record DismissRequest(
    String gameId,
    Long userId
) {}
