package com.batuhan.chess.api.dto.game;

import com.batuhan.chess.domain.model.chess.Color;
import com.batuhan.chess.domain.model.chess.GameStatus;

import java.util.List;

public record GameResponse(
    String gameId,
    String boardRepresentation,
    Color currentTurn,
    GameStatus status,
    List<ExecutedMove> lastMoves,
    List<String> moveHistory,
    String lastMoveMessage,
    Long whiteId,
    Long blackId
) {
    public record ExecutedMove(int fromFile, int fromRank, int toFile, int toRank, String pieceType) {}
}
