package com.batuhan.chess.identity.api.dto.auth;

import lombok.Builder;

@Builder
public record AuthResponseDTO(
    String token,
    String username,
    String email,
    Integer eloRating,
    boolean isGuest
) {}
