package com.batuhan.chess.domain.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Domain entity representing a chess game session.
 * Orchestrates movement validation, turn management, and game status updates.
 */
public class Game {

    private final Board board;
    private Color currentTurn;
    private GameStatus status;
    private Move lastMove;

    private final List<String> boardHistory = new ArrayList<>();
    private int halfMoveClock = 0;

    private static final int WHITE_PROMOTION_RANK = 7;
    private static final int BLACK_PROMOTION_RANK = 0;

    public Game(Board board) {
        this.board = board;
        this.currentTurn = Color.WHITE;
        this.status = GameStatus.ACTIVE;
        this.boardHistory.add(board.toString() + "|WHITE");
    }

    /**
     * Processes a move from a start position to an end position.
     * Validates turn order, piece movement rules, and move safety (king protection).
     *
     * @param start The starting position of the piece.
     * @param end   The target position for the piece.
     * @return true if the move was successful and the turn is finalized, false otherwise.
     */
    public boolean makeMove(Position start, Position end) {
        if (status != GameStatus.ACTIVE) return false;

        return board.getPiece(start)
            .filter(piece -> piece.getColor() == currentTurn)
            .filter(piece -> {
                if (isEnPassantAttempt(piece, end)) {
                    return canEnPassant(start, end);
                }
                return piece.isValidMove(end, board);
            })
            .filter(piece -> isMoveSafe(start, end, piece))
            .map(piece -> {
                executeMove(start, end, piece);
                finalizeTurn();
                return true;
            })
            .orElse(false);
    }

    /**
     * Validates if a move is legal beyond basic piece geometry.
     * Includes simulation to prevent moves that leave the King in check,
     * and specific checks for Castling and En Passant.
     */
    private boolean isMoveSafe(Position start, Position end, Piece piece) {
        // 1. Validate special move requirements (Castling & En Passant)
        if (isCastlingAttempt(piece, start, end) && !canCastle(start, end)) return false;
        if (isEnPassantAttempt(piece, end) && !canEnPassant(start, end)) return false;

        // 2. Simulate the move and verify King's safety
        return simulateAndCheckSafety(start, end, piece);
    }

    /**
     * Temporarily modifies the board to check for self-check scenarios.
     * Uses a try-finally block to ensure the board is rolled back even if an error occurs.
     */
    private boolean simulateAndCheckSafety(Position start, Position end, Piece piece) {
        boolean isEnPassant = isEnPassantAttempt(piece, end);
        Piece capturedEnPassant = isEnPassant ? board.getPiece(lastMove.end()).orElse(null) : null;
        Piece targetOriginalPiece = board.getPiece(end).orElse(null);

        try {
            // Apply temporary move
            if (isEnPassant) board.setPieceAt(lastMove.end(), null);
            board.setPieceAt(start, null);
            board.setPieceAt(end, piece);

            return !isInCheck(currentTurn);
        } finally {
            // Rollback the board state
            board.setPieceAt(start, piece);
            board.setPieceAt(end, targetOriginalPiece);
            if (isEnPassant) board.setPieceAt(lastMove.end(), capturedEnPassant);
        }
    }

    /**
     * Finalizes the turn by switching players and updating the game state (Check, Mate, Stalemate).
     */
    private void finalizeTurn() {
        switchTurn();
        updateGameStatus();
    }

    /**
     * Physically updates the board state for normal and special moves.
     * Handles King/Rook relocation for Castling and Pawn removal for En Passant.
     */
    private void executeMove(Position start, Position end, Piece piece) {
        updateDrawConditions(piece, end);
        board.setPieceAt(start, null);

        // Handle side effects of special moves
        if (isCastlingAttempt(piece, start, end)) {
            handleCastlingRookMove(start, end);
        } else if (isEnPassantAttempt(piece, end)) {
            board.setPieceAt(lastMove.end(), null);
        }

        // Handle Pawn Promotion or regular movement
        if (isPromotionSituation(piece, end)) {
            board.setPieceAt(end, new Queen(piece.getColor(), end));
        } else {
            board.setPieceAt(end, piece);
        }

        this.lastMove = new Move(start, end, piece);
        piece.setHasMoved(true);
    }

    private void updateDrawConditions(Piece piece, Position end) {
        if (piece.getType() == PieceType.PAWN || board.getPiece(end).isPresent()) {
            halfMoveClock = 0;
            boardHistory.clear();
        } else {
            halfMoveClock++;
        }

        String currentBoardState = board.toString() + "|" + currentTurn.name();
        boardHistory.add(currentBoardState);
    }

    private boolean isDraw() {
        if (halfMoveClock >= 100) return true;

        String currentPosition = board.toString() + "|" + currentTurn.name();
        long occurrences = boardHistory.stream()
            .filter(state -> state.equals(currentPosition))
            .count();

        return occurrences >= 3;
    }

    // --- Special Rule Helpers ---
    private boolean isCastlingAttempt(Piece piece, Position start, Position end) {
        return piece.getType() == PieceType.KING && Math.abs(end.file() - start.file()) == 2;
    }

    private boolean canCastle(Position start, Position end) {
        if (isInCheck(currentTurn)) return false;

        int direction = (end.file() > start.file()) ? 1 : -1;
        int rookFile = (direction == 1) ? 7 : 0;
        Position rookPos = new Position(rookFile, start.rank());

        return board.getPiece(rookPos)
            .filter(p -> p.getType() == PieceType.ROOK && !p.hasMoved())
            .filter(p -> isPathClear(start, rookPos))
            .filter(p -> areCastlingSquaresSafe(currentTurn, start, direction))
            .isPresent();
    }

    private void handleCastlingRookMove(Position kingStart, Position kingEnd) {
        int direction = (kingEnd.file() > kingStart.file()) ? 1 : -1;
        int rookStartFile = (direction == 1) ? 7 : 0;
        int rookEndFile = (direction == 1) ? 5 : 3;

        Position rookStart = new Position(rookStartFile, kingStart.rank());
        Position rookEnd = new Position(rookEndFile, kingStart.rank());

        Piece rook = board.getPiece(rookStart).orElseThrow();
        board.setPieceAt(rookStart, null);
        board.setPieceAt(rookEnd, rook);
        rook.setHasMoved(true);
    }

    private boolean isEnPassantAttempt(Piece piece, Position end) {
        return piece.getType() == PieceType.PAWN &&
            Math.abs(end.file() - piece.getPosition().file()) == 1 &&
            board.getPiece(end).isEmpty();
    }

    private boolean canEnPassant(Position start, Position end) {
        if (lastMove == null) return false;
        return lastMove.piece().getType() == PieceType.PAWN &&
            lastMove.end().file() == end.file() &&
            lastMove.end().rank() == start.rank() &&
            Math.abs(lastMove.end().rank() - lastMove.start().rank()) == 2;
    }

    // --- Status Check Helpers ---
    public void resign(Color color) {
        this.status = GameStatus.RESIGNED;
    }

    public boolean isInCheck(Color color) {
        return isSquareAttacked(findKingPosition(color), getOpponentColor(color));
    }

    public boolean isCheckmate(Color color) {
        return isInCheck(color) && board.findAllPieces().stream()
            .filter(p -> p.getColor() == color)
            .noneMatch(this::hasAnyLegalMove);
    }

    private void updateGameStatus() {
        if (isInCheck(currentTurn)) {
            status = isCheckmate(currentTurn) ? GameStatus.CHECKMATE : GameStatus.CHECK;
        } else if (isStalemate(currentTurn)) {
            status = GameStatus.STALEMATE;
        } else if (isDraw()) {
            status = GameStatus.DRAW;
        } else {
            status = GameStatus.ACTIVE;
        }
    }

    private boolean isStalemate(Color color) {
        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == color)
            .noneMatch(this::hasAnyLegalMove);
    }

    private boolean hasAnyLegalMove(Piece piece) {
        for (int file = 0; file < 8; file++) {
            for (int rank = 0; rank < 8; rank++) {
                Position target = new Position(file, rank);

                boolean canMoveBase = isEnPassantAttempt(piece, target)
                    ? canEnPassant(piece.getPosition(), target)
                    : piece.isValidMove(target, board);

                if (canMoveBase && isMoveSafe(piece.getPosition(), target, piece)) {
                    return true;
                }
            }
        }
        return false;
    }

    // --- Core Low-level Logic ---
    private boolean isPromotionSituation(Piece piece, Position end) {
        if (piece.getType() != PieceType.PAWN) return false;
        int promotionRank = (piece.getColor() == Color.WHITE) ? WHITE_PROMOTION_RANK : BLACK_PROMOTION_RANK;
        return end.rank() == promotionRank;
    }

    private boolean isPathClear(Position start, Position end) {
        int fileStep = Integer.compare(end.file(), start.file());
        int currFile = start.file() + fileStep;
        while (currFile != end.file()) {
            if (board.getPiece(new Position(currFile, start.rank())).isPresent()) return false;
            currFile += fileStep;
        }
        return true;
    }

    private boolean areCastlingSquaresSafe(Color color, Position start, int direction) {
        for (int i = 1; i <= 2; i++) {
            Position stepPos = new Position(start.file() + (i * direction), start.rank());
            if (isSquareAttacked(stepPos, getOpponentColor(color))) return false;
        }
        return true;
    }

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
            .orElseThrow(() -> new IllegalStateException(color + " King not found"));
    }

    private Color getOpponentColor(Color color) {
        return (color == Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    public record Move(Position start, Position end, Piece piece) {}

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
