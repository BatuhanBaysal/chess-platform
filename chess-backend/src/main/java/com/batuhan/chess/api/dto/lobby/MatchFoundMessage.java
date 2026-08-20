package com.batuhan.chess.api.dto.lobby;

import lombok.Builder;

@Builder
public record MatchFoundMessage(
    String gameId,
    String status,
    String color,
    Long opponentId,
    String opponentName,
    String theme
) {}
