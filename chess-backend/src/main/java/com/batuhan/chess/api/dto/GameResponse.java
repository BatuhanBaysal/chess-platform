package com.batuhan.chess.api.dto;

import com.batuhan.chess.domain.model.Color;
import com.batuhan.chess.domain.model.GameStatus;

import java.util.List;

public record GameResponse(
    String gameId,
    String boardRepresentation,
    Color currentTurn,
    GameStatus status,
    List<ExecutedMove> lastMoves,
    List<String> moveHistory,
    String lastMoveMessage
) {
    public record ExecutedMove(int fromFile, int fromRank, int toFile, int toRank, String pieceType) {}
}
