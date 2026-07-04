package com.batuhan.chess.api.dto.user;

import lombok.Builder;

@Builder
public record UserResponseDTO(
    String username,
    String email,
    Integer eloRating,
    int totalWins,
    int totalLosses,
    int totalDraws
) {}
