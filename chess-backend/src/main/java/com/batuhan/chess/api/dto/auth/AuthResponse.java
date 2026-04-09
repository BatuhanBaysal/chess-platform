package com.batuhan.chess.api.dto.auth;

import lombok.Builder;

@Builder
public record AuthResponse(
    Long id,
    String token,
    String username,
    String email,
    Integer eloRating,
    boolean isGuest
) {}
