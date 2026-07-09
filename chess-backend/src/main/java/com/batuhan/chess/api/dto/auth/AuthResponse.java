package com.batuhan.chess.api.dto.auth;

import com.batuhan.chess.domain.model.user.UserRole;
import lombok.Builder;

@Builder
public record AuthResponse(
    Long id,
    String token,
    String username,
    String email,
    Integer eloRating,
    UserRole role
) {}
