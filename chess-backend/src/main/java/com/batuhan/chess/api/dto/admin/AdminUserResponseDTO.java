package com.batuhan.chess.api.dto.admin;

import com.batuhan.chess.domain.model.user.UserRole;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record AdminUserResponseDTO(
    Long id,
    String username,
    String email,
    Integer eloRating,
    int totalWins,
    int totalLosses,
    int totalDraws,
    UserRole role,
    LocalDateTime createdAt
) {}
