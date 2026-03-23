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
     * Primary entry point for making a move.
     * Validates game status, turn order, piece geometry, and king safety.
     *
     * @param start Initial position of the piece.
     * @param end Target position.
     * @return true if the move is legal and executed, false otherwise.
     */
    public boolean makeMove(Position start, Position end) {
        System.out.println("LOG: Move attempt from " + start + " to " + end);

        if (isGameOver()) {
            System.out.println("DEBUG: Move rejected. Game is over.");
            return false;
        }

        return board.getPiece(start)
            .filter(piece -> {
                boolean isTurn = piece.getColor() == currentTurn;
                if (!isTurn) System.out.println("DEBUG: Turn mismatch. Current: " + currentTurn);
                return isTurn;
            })
            .filter(piece -> {
                boolean valid = isEnPassantAttempt(piece, end) ? canEnPassant(start, end) : piece.isValidMove(end, board);
                if (!valid) System.out.println("DEBUG: Geometric validation failed for " + piece.getType());
                return valid;
            })
            .filter(piece -> {
                boolean safe = isMoveSafe(start, end, piece);
                if (!safe) System.out.println("DEBUG: King is in check after move.");
                return safe;
            })
            .map(piece -> {
                executeMove(start, end, piece);
                finalizeTurn();
                return true;
            })
            .orElse(false);
    }

    private boolean isGameOver() {
        return status == GameStatus.CHECKMATE || status == GameStatus.STALEMATE ||
            status == GameStatus.DRAW || status == GameStatus.RESIGNED;
    }

    private boolean isMoveSafe(Position start, Position end, Piece piece) {
        if (isCastlingAttempt(piece, start, end) && !canCastle(start, end)) return false;
        if (isEnPassantAttempt(piece, end) && !canEnPassant(start, end)) return false;

        return simulateAndCheckSafety(start, end, piece);
    }

    /**
     * Temporarily modifies the board to verify if the move leaves the King under attack.
     * Ensures board rollback in the finally block.
     */
    private boolean simulateAndCheckSafety(Position start, Position end, Piece piece) {
        boolean isEnPassant = isEnPassantAttempt(piece, end);
        Piece capturedEnPassant = isEnPassant ? board.getPiece(lastMove.end()).orElse(null) : null;
        Piece targetOriginalPiece = board.getPiece(end).orElse(null);
        Position originalPosition = piece.getPosition();

        try {
            if (isEnPassant) board.setPieceAt(lastMove.end(), null);
            board.setPieceAt(start, null);
            board.setPieceAt(end, piece);
            piece.setPosition(end);
            return !isInCheck(piece.getColor());

        } catch (Exception e) {
            System.err.println("FATAL: Simulation error: " + e.getMessage());
            return false;
        } finally {
            board.setPieceAt(start, piece);
            board.setPieceAt(end, targetOriginalPiece);
            if (isEnPassant) board.setPieceAt(lastMove.end(), capturedEnPassant);
            piece.setPosition(originalPosition);
        }
    }

    private void finalizeTurn() {
        switchTurn();
        updateGameStatus();
    }

    /**
     * Performs the actual state changes on the board, handling special moves
     * like promotion, castling, and en passant.
     */
    private void executeMove(Position start, Position end, Piece piece) {
        updateDrawConditions(piece, end);
        board.setPieceAt(start, null);

        if (isCastlingAttempt(piece, start, end)) {
            handleCastlingRookMove(start, end);
        } else if (isEnPassantAttempt(piece, end)) {
            board.setPieceAt(lastMove.end(), null);
        }

        if (isPromotionSituation(piece, end)) {
            board.setPieceAt(end, new Queen(piece.getColor(), end));
        } else {
            board.setPieceAt(end, piece);
            piece.setPosition(end);
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

    // --- Special Rule Logic ---

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

    // --- State Assessment ---

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

    /**
     * Checks if a piece has at least one legal destination.
     * Essential for stalemate and checkmate detection.
     */
    private boolean hasAnyLegalMove(Piece piece) {
        Position currentPos = piece.getPosition();
        for (int file = 0; file < 8; file++) {
            for (int rank = 0; rank < 8; rank++) {
                Position target = new Position(file, rank);

                boolean isFriendlyFire = board.getPiece(target)
                    .map(p -> p.getColor() == piece.getColor())
                    .orElse(false);
                if (isFriendlyFire) continue;

                boolean canMoveBase = (piece.getType() == PieceType.PAWN)
                    ? piece.isValidMove(target, board)
                    : isGeometricMoveValid(piece, target);

                if (canMoveBase && simulateAndCheckSafety(currentPos, target, piece)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isGeometricMoveValid(Piece p, Position end) {
        Position start = p.getPosition();
        int fileDiff = Math.abs(end.file() - start.file());
        int rankDiff = Math.abs(end.rank() - start.rank());

        switch (p.getType()) {
            case QUEEN:
                return (fileDiff == rankDiff || start.file() == end.file() || start.rank() == end.rank()) && isPathClear(start, end);
            case ROOK:
                return (start.file() == end.file() || start.rank() == end.rank()) && isPathClear(start, end);
            case BISHOP:
                return (fileDiff == rankDiff) && isPathClear(start, end);
            case KNIGHT:
                return (fileDiff == 1 && rankDiff == 2) || (fileDiff == 2 && rankDiff == 1);
            case KING:
                return fileDiff <= 1 && rankDiff <= 1;
            default: return false;
        }
    }

    // --- Validation Utilities ---

    private boolean isPromotionSituation(Piece piece, Position end) {
        if (piece.getType() != PieceType.PAWN) return false;
        int promotionRank = (piece.getColor() == Color.WHITE) ? WHITE_PROMOTION_RANK : BLACK_PROMOTION_RANK;
        return end.rank() == promotionRank;
    }

    private boolean isPathClear(Position start, Position end) {
        int fileStep = Integer.compare(end.file() - start.file(), 0);
        int rankStep = Integer.compare(end.rank() - start.rank(), 0);

        int currFile = start.file() + fileStep;
        int currRank = start.rank() + rankStep;

        while (currFile != end.file() || currRank != end.rank()) {
            if (board.getPiece(new Position(currFile, currRank)).isPresent()) return false;
            currFile += fileStep;
            currRank += rankStep;
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

    /**
     * Evaluates if a given square can be captured by the opponent.
     */
    private boolean isSquareAttacked(Position pos, Color attackerColor) {
        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == attackerColor)
            .anyMatch(p -> {
                Position pPos = p.getPosition();
                int fileDiff = pos.file() - pPos.file();
                int rankDiff = pos.rank() - pPos.rank();
                int absFileDiff = Math.abs(fileDiff);
                int absRankDiff = Math.abs(rankDiff);

                switch (p.getType()) {
                    case PAWN:
                        int attackDirection = (p.getColor() == Color.WHITE) ? 1 : -1;
                        return absFileDiff == 1 && rankDiff == attackDirection;
                    case KNIGHT:
                        return (absFileDiff == 1 && absRankDiff == 2) || (absFileDiff == 2 && absRankDiff == 1);
                    case KING:
                        return absFileDiff <= 1 && absRankDiff <= 1;
                    case ROOK:
                    case BISHOP:
                    case QUEEN:
                        return isGeometricMoveValid(p, pos);
                    default: return false;
                }
            });
    }

    private void switchTurn() {
        this.currentTurn = (currentTurn == Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    private Position findKingPosition(Color color) {
        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == color && p.getType() == PieceType.KING)
            .map(Piece::getPosition)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("CRITICAL: " + color + " King not found"));
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
