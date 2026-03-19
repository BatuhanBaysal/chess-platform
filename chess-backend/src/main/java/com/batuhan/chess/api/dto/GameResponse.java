package com.batuhan.chess.api.dto;

import com.batuhan.chess.domain.model.Color;
import com.batuhan.chess.domain.model.GameStatus;

public record GameResponse(
    String gameId,
    String boardRepresentation,
    Color currentTurn,
    GameStatus status
) {}
