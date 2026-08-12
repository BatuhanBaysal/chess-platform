package com.batuhan.chess.domain.model.chess;

import java.util.Locale;

public class PieceFactory {

    private PieceFactory() {
        throw new IllegalStateException("Utility class");
    }

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
        if (type == null || type.isBlank()) {
            return new Queen(color, position);
        }

        String normalizedType = type.trim().toLowerCase(Locale.ROOT);

        return switch (normalizedType) {
            case "r", "rook" -> new Rook(color, position);
            case "b", "bishop" -> new Bishop(color, position);
            case "n", "knight" -> new Knight(color, position);
            default -> new Queen(color, position);
        };
    }
}
