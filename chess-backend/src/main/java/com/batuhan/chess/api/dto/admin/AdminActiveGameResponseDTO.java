package com.batuhan.chess.api.dto.admin;

import com.batuhan.chess.domain.model.chess.GameStatus;
import lombok.Builder;

@Builder
public record AdminActiveGameResponseDTO(
    String gameId,
    Long whitePlayerId,
    Long blackPlayerId,
    GameStatus status,
    long whiteRemainingTimeMs,
    long blackRemainingTimeMs
) {}
