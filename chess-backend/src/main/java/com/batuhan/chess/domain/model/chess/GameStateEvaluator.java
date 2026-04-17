package com.batuhan.chess.domain.model.chess;

import java.util.List;

public class GameStateEvaluator {

    public GameStatus evaluateStatus(Board board, Color currentTurn, MoveValidator validator, int halfMoveClock, List<String> boardHistory, Game.Move lastMove) {
        boolean inCheck = validator.isInCheck(currentTurn, board);
        boolean hasLegalMove = hasAnyLegalMove(board, currentTurn, validator, lastMove);

        if (inCheck) {
            return hasLegalMove ? GameStatus.CHECK : GameStatus.CHECKMATE;
        } else {
            if (!hasLegalMove) return GameStatus.STALEMATE;
            if (isDraw(halfMoveClock, boardHistory, board, currentTurn) || isInsufficientMaterial(board)) return GameStatus.DRAW;
            return GameStatus.ACTIVE;
        }
    }

    private boolean hasAnyLegalMove(Board board, Color color, MoveValidator validator, Game.Move lastMove) {
        return board.findPiecesByColor(color).stream()
            .anyMatch(piece -> piece.getPseudoLegalMoves(board).stream()
                .anyMatch(target -> validator.isMoveLegal(piece.getPosition(), target, board, color, lastMove)));
    }

    private boolean isDraw(int halfMoveClock, List<String> boardHistory, Board board, Color turn) {
        if (halfMoveClock >= 100) return true;
        String currentState = board.toString() + "|" + turn.name();
        return boardHistory.stream().filter(state -> state.equals(currentState)).count() >= 3;
    }

    private boolean isInsufficientMaterial(Board board) {
        List<Piece> pieces = board.findAllPieces();
        if (pieces.size() <= 2) return true;
        if (pieces.size() == 3) {
            return pieces.stream().anyMatch(p -> p.getType() == PieceType.BISHOP || p.getType() == PieceType.KNIGHT);
        }
        return false;
    }
}
