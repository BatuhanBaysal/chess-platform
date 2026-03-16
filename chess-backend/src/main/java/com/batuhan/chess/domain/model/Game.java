package com.batuhan.chess.domain.model;

/**
 * Domain entity representing a chess game session.
 * Orchestrates movement, turn management, and game status.
 */
public class Game {

    private final Board board;
    private Color currentTurn;
    private GameStatus status;

    public Game(Board board) {
        this.board = board;
        this.currentTurn = Color.WHITE;
        this.status = GameStatus.ACTIVE;
    }

    /**
     * Core method to process a player's move.
     * Validates turn order, movement rules, and ensures the move doesn't leave the King in check.
     */
    public boolean makeMove(Position start, Position end) {
        if (status != GameStatus.ACTIVE) return false;

        return board.getPiece(start)
            .filter(piece -> piece.getColor() == currentTurn)
            .filter(piece -> piece.isValidMove(end, board))
            .filter(piece -> isMoveSafe(start, end, piece))
            .map(piece -> {
                executeMove(start, end, piece);
                switchTurn();
                updateGameStatus();
                return true;
            })
            .orElse(false);
    }

    /**
     * Determines if the King of the given color is currently under attack.
     */
    public boolean isInCheck(Color color) {
        Position kingPosition = findKingPosition(color);
        Color opponentColor = getOpponentColor(color);

        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == opponentColor)
            .anyMatch(opponentPiece -> opponentPiece.isValidMove(kingPosition, board));
    }

    /**
     * Checks if the given color has no legal moves left while being in check.
     */
    public boolean isCheckmate(Color color) {
        if (!isInCheck(color)) {
            return false;
        }

        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == color)
            .noneMatch(this::hasAnyLegalMove);
    }

    public void resign(Color color) {
        this.status = GameStatus.RESIGNED;
    }

    /**
     * Simulates a move on a temporary state to ensure it doesn't result in a self-check.
     * Essential for enforcing the rule that a player cannot move into check.
     */
    private boolean isMoveSafe(Position start, Position end, Piece piece) {
        Piece targetOriginalPiece = board.getPiece(end).orElse(null);

        board.setPieceAt(start, null);
        board.setPieceAt(end, piece);

        boolean stillInCheck = isInCheck(currentTurn);

        board.setPieceAt(start, piece);
        board.setPieceAt(end, targetOriginalPiece);

        return !stillInCheck;
    }

    private boolean hasAnyLegalMove(Piece piece) {
        for (int file = 0; file < 8; file++) {
            for (int rank = 0; rank < 8; rank++) {
                Position target = new Position(file, rank);
                if (piece.isValidMove(target, board) && isMoveSafe(piece.getPosition(), target, piece)) {
                    return true;
                }
            }
        }
        return false;
    }

    private void updateGameStatus() {
        if (isCheckmate(currentTurn)) {
            this.status = GameStatus.CHECKMATE;
        }
    }

    private void executeMove(Position start, Position end, Piece piece) {
        board.setPieceAt(start, null);
        board.setPieceAt(end, piece);
    }

    private void switchTurn() {
        this.currentTurn = (currentTurn == Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    private Position findKingPosition(Color color) {
        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == color && p.getType() == PieceType.KING)
            .map(Piece::getPosition)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(color + " King not found on board"));
    }

    private Color getOpponentColor(Color color) {
        return (color == Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    public Board getBoard() {
        return board;
    }

    public Color getCurrentTurn() {
        return currentTurn;
    }

    public GameStatus getStatus() {
        return status;
    }
}
