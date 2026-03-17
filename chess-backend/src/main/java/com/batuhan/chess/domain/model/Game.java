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
        return isSquareAttacked(findKingPosition(color), getOpponentColor(color));
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
     * Validates if a move is legal beyond basic piece geometry.
     * Checks for self-check scenarios and enforces all specific Castling requirements:
     * - King must not be in check.
     * - The path and landing squares must not be under attack.
     * - The corresponding Rook must not have moved.
     */
    private boolean isMoveSafe(Position start, Position end, Piece piece) {
        if (piece.getType() == PieceType.KING && Math.abs(end.file() - start.file()) == 2) {
            if (isInCheck(currentTurn)) return false;

            int direction = (end.file() > start.file()) ? 1 : -1;
            int rookFile = (direction == 1) ? 7 : 0;
            Position rookPos = new Position(rookFile, start.rank());

            boolean canCastle = board.getPiece(rookPos)
                .filter(p -> p.getType() == PieceType.ROOK && !p.hasMoved())
                .filter(p -> isPathClear(start, rookPos))
                .filter(p -> areCastlingSquaresSafe(currentTurn, start, direction))
                .isPresent();

            if (!canCastle) return false;
        }

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

    /**
     * Physically updates the board state.
     * Handles multi-piece movements like Castling and piece transformations like Promotion.
     * Updates the movement history (hasMoved) for the involved pieces.
     */
    private void executeMove(Position start, Position end, Piece piece) {
        board.setPieceAt(start, null);

        if (piece.getType() == PieceType.KING && Math.abs(end.file() - start.file()) == 2) {
            int direction = (end.file() > start.file()) ? 1 : -1;
            int rookStartFile = (direction == 1) ? 7 : 0;
            int rookEndFile = (direction == 1) ? 5 : 3;

            Position rookStart = new Position(rookStartFile, start.rank());
            Position rookEnd = new Position(rookEndFile, start.rank());

            Piece rook = board.getPiece(rookStart).orElseThrow();
            board.setPieceAt(rookStart, null);
            board.setPieceAt(rookEnd, rook);
            rook.setHasMoved(true);
        }

        if (isPromotionSituation(piece, end)) {
            board.setPieceAt(end, new Queen(piece.getColor(), end));
        } else {
            board.setPieceAt(end, piece);
        }
        piece.setHasMoved(true);
    }

    private boolean isPromotionSituation(Piece piece, Position end) {
        if (piece.getType() != PieceType.PAWN) {
            return false;
        }
        int promotionRank = (piece.getColor() == Color.WHITE) ? 7 : 0;
        return end.rank() == promotionRank;
    }

    private boolean isPathClear(Position start, Position end) {
        int fileStep = Integer.compare(end.file(), start.file());
        int currFile = start.file() + fileStep;

        while (currFile != end.file()) {
            if (board.getPiece(new Position(currFile, start.rank())).isPresent()) {
                return false;
            }
            currFile += fileStep;
        }
        return true;
    }

    private boolean areCastlingSquaresSafe(Color color, Position start, int direction) {
        for (int i = 1; i <= 2; i++) {
            Position stepPos = new Position(start.file() + (i * direction), start.rank());
            if (isSquareAttacked(stepPos, getOpponentColor(color))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Helper to check if a specific square is under threat by any piece of the given color.
     * Used for both check detection and castling safety validation.
     */
    private boolean isSquareAttacked(Position pos, Color attackerColor) {
        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == attackerColor)
            .anyMatch(p -> p.isValidMove(pos, board));
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
