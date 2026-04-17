package com.batuhan.chess.domain.model.chess;

public class PieceFactory {

    public static Piece createPiece(PieceType type, Color color, Position position) {
        return switch (type) {
            case PAWN -> new Pawn(color, position);
            case KNIGHT -> new Knight(color, position);
            case BISHOP -> new Bishop(color, position);
            case ROOK -> new Rook(color, position);
            case QUEEN -> new Queen(color, position);
            case KING -> new King(color, position);
        };
    }

    public static Piece createPromotedPiece(String type, Color color, Position position) {
        String normalizedType = (type == null || type.isBlank()) ? "QUEEN" : type.toUpperCase();
        return switch (normalizedType) {
            case "ROOK" -> new Rook(color, position);
            case "BISHOP" -> new Bishop(color, position);
            case "KNIGHT" -> new Knight(color, position);
            case "QUEEN" -> new Queen(color, position);
            default -> new Queen(color, position);
        };
    }
}
