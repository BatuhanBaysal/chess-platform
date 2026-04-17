package com.batuhan.chess.domain.model.chess;

public class MoveExecutor {

    public void execute(Position start, Position end, Piece piece, String promotionType, Board board, MoveValidator validator, Game.Move lastMove) {
        if (validator.isCastlingAttempt(piece, start, end)) {
            handleCastling(start, end, board);
        } else if (validator.isEnPassantAttempt(piece, end, board, lastMove)) {
            handleEnPassant(start, end, board);
        }

        board.removePiece(start);

        if (validator.isPromotionSituation(piece, end)) {
            Piece promoted = PieceFactory.createPromotedPiece(promotionType, piece.getColor(), end);
            board.setPieceAt(end, promoted);
            promoted.setHasMoved(true);
        } else {
            board.setPieceAt(end, piece);
            piece.setPosition(end);
            piece.setHasMoved(true);
        }
    }

    private void handleCastling(Position kingStart, Position kingEnd, Board board) {
        int direction = (kingEnd.file() > kingStart.file()) ? 1 : -1;
        Position rookStart = new Position((direction == 1) ? 7 : 0, kingStart.rank());
        Position rookEnd = new Position((direction == 1) ? 5 : 3, kingStart.rank());

        board.getPiece(rookStart).ifPresent(rook -> {
            board.removePiece(rookStart);
            board.setPieceAt(rookEnd, rook);
            rook.setPosition(rookEnd);
            rook.setHasMoved(true);
        });
    }

    private void handleEnPassant(Position start, Position end, Board board) {
        board.removePiece(new Position(end.file(), start.rank()));
    }
}
