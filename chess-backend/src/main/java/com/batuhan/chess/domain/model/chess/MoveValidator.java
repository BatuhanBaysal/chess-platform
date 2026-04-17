package com.batuhan.chess.domain.model.chess;

import java.util.Optional;

public class MoveValidator {

    public boolean isMoveLegal(Position start, Position end, Board board, Color currentTurn, Game.Move lastMove) {
        return board.getPiece(start)
            .filter(piece -> piece.getColor() == currentTurn)
            .filter(piece -> isBaseMoveValid(piece, end, board, lastMove))
            .filter(piece -> isMoveSafe(start, end, piece, board, currentTurn))
            .isPresent();
    }

    private boolean isBaseMoveValid(Piece piece, Position end, Board board, Game.Move lastMove) {
        if (isEnPassantAttempt(piece, end, board)) {
            return canEnPassant(piece.getPosition(), end, lastMove, piece.getColor());
        }
        if (isCastlingAttempt(piece, piece.getPosition(), end)) {
            return canCastle(piece.getPosition(), end, board, piece.getColor());
        }
        return piece.isPseudoLegalMove(end, board);
    }

    public boolean isInCheck(Color color, Board board) {
        return board.findKing(color)
            .map(king -> isSquareAttacked(king.getPosition(), color.opposite(), board))
            .orElse(false);
    }

    public boolean isSquareAttacked(Position pos, Color attackerColor, Board board) {
        return board.findPiecesByColor(attackerColor).stream()
            .anyMatch(p -> {
                if (p.getType() == PieceType.KING) {
                    return Math.abs(pos.file() - p.getPosition().file()) <= 1 &&
                        Math.abs(pos.rank() - p.getPosition().rank()) <= 1;
                }
                if (p.getType() == PieceType.PAWN) {
                    int dir = (p.getColor() == Color.WHITE) ? 1 : -1;
                    return Math.abs(pos.file() - p.getPosition().file()) == 1 &&
                        (pos.rank() - p.getPosition().rank()) == dir;
                }
                return p.isPseudoLegalMove(pos, board);
            });
    }

    public boolean isMoveSafe(Position start, Position end, Piece piece, Board board, Color turn) {
        Board tempBoard = board.copy();
        if (isEnPassantAttempt(piece, end, board)) {
            tempBoard.removePiece(new Position(end.file(), start.rank()));
        }
        tempBoard.removePiece(start);
        Piece tempPiece = PieceFactory.createPiece(piece.getType(), piece.getColor(), end);
        tempBoard.setPieceAt(end, tempPiece);
        return !isInCheck(turn, tempBoard);
    }

    public boolean canCastle(Position start, Position end, Board board, Color turn) {
        Optional<Piece> kingOpt = board.getPiece(start);
        if (kingOpt.isEmpty() || kingOpt.get().hasMoved() || isInCheck(turn, board)) return false;

        int direction = (end.file() > start.file()) ? 1 : -1;
        int targetRookFile = (direction == 1) ? 7 : 0;
        Optional<Piece> rook = board.getPiece(new Position(targetRookFile, start.rank()));

        if (rook.isEmpty() || rook.get().getType() != PieceType.ROOK || rook.get().hasMoved()) return false;

        int steps = (direction == 1) ? 2 : 3;
        for (int f = 1; f <= steps; f++) {
            Position pos = new Position(start.file() + (f * direction), start.rank());
            if (board.getPiece(pos).isPresent()) return false;
        }

        for (int i = 1; i <= 2; i++) {
            Position checkPos = new Position(start.file() + (i * direction), start.rank());
            if (isSquareAttacked(checkPos, turn.opposite(), board)) return false;
        }

        return true;
    }

    public boolean canEnPassant(Position start, Position end, Game.Move lastMove, Color turn) {
        if (lastMove == null || lastMove.piece() == null || lastMove.piece().getType() != PieceType.PAWN) return false;

        boolean isDoubleStep = Math.abs(lastMove.end().rank() - lastMove.start().rank()) == 2;
        int direction = (turn == Color.WHITE) ? 1 : -1;

        return isDoubleStep &&
            lastMove.end().file() == end.file() &&
            lastMove.end().rank() == start.rank() &&
            end.rank() == start.rank() + direction &&
            Math.abs(start.file() - end.file()) == 1;
    }

    public boolean isEnPassantAttempt(Piece piece, Position end, Board board) {
        if (piece.getType() != PieceType.PAWN) return false;
        return Math.abs(end.file() - piece.getPosition().file()) == 1 && board.getPiece(end).isEmpty();
    }

    public boolean isCastlingAttempt(Piece piece, Position start, Position end) {
        return piece.getType() == PieceType.KING && Math.abs(end.file() - start.file()) == 2;
    }

    public boolean isPromotionSituation(Piece piece, Position end) {
        if (piece.getType() != PieceType.PAWN) return false;
        int promoRank = (piece.getColor() == Color.WHITE) ? 7 : 0;
        return end.rank() == promoRank;
    }
}
