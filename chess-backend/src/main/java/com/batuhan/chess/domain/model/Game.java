package com.batuhan.chess.domain.model;

/**
 * Domain entity representing a chess game session.
 * Orchestrates movement, turn management, and game status.
 */
public class Game {

    private final Board board;
    private Color currentTurn;
    private GameStatus status;

    public Game() {
        this.board = new Board(true);
        this.currentTurn = Color.WHITE;
        this.status = GameStatus.ACTIVE;
    }

    /**
     * Attempts to execute a move on the board.
     * Validates the turn, the piece's movement rules, and the game status.
     * * @param start Starting position of the move.
     * @param end Target position for the piece.
     * @return true if the move was successful and turn was switched, false otherwise.
     */
    public boolean makeMove(Position start, Position end) {
        if (status != GameStatus.ACTIVE) return false;

        return board.getPiece(start)
            .filter(piece -> piece.getColor() == currentTurn)
            .filter(piece -> piece.isValidMove(end, board))
            .map(piece -> {
                executeMove(start, end, piece);
                switchTurn();
                return true;
            })
            .orElse(false);
    }

    private void executeMove(Position start, Position end, Piece piece) {
        board.setPieceAt(start, null);
        board.setPieceAt(end, piece);
    }

    private void switchTurn() {
        this.currentTurn = (currentTurn == Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    public void resign(Color color) {
        this.status = GameStatus.RESIGNED;
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
