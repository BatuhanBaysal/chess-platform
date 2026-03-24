package com.batuhan.chess.api.dto;

import jakarta.validation.constraints.NotNull;

public record MoveRequest(
    @NotNull String gameId,
    @NotNull Integer fromFile,
    @NotNull Integer fromRank,
    @NotNull Integer toFile,
    @NotNull Integer toRank,
    String promotionType
) {}
