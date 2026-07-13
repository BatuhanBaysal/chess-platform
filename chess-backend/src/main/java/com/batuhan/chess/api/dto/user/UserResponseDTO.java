package com.batuhan.chess.api.dto.user;

import com.batuhan.chess.domain.model.user.UserRole;
import lombok.Builder;

@Builder
public record UserResponseDTO(
    String username,
    String email,
    Integer eloRating,
    int totalWins,
    int totalLosses,
    int totalDraws,
    int totalGames,
    UserRole role
) {}
