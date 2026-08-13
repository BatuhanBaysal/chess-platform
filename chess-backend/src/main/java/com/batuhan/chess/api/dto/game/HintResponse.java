package com.batuhan.chess.api.dto.game;

public record HintResponse(
    String bestMoveUci,
    int evaluationScore,
    String message
) {}
