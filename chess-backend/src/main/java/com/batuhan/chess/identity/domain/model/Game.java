package com.batuhan.chess.identity.domain.model;

import com.batuhan.chess.identity.api.dto.game.GameResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * Domain entity representing a chess game session.
 * Orchestrates movement validation, turn management, and game status updates.
 */
public class Game {

    private static final int WHITE_PROMOTION_RANK = 7;
    private static final int BLACK_PROMOTION_RANK = 0;

    private final Board board;
    private final List<String> boardHistory = new ArrayList<>();
    private final List<String> humanReadableHistory = new ArrayList<>();

    private Color currentTurn;
    private GameStatus status;
    private Move lastMove;
    private int halfMoveClock = 0;
    private String lastMoveMessage = "Game started. White to move.";

    public Game(Board board) {
        this.board = board;
        this.currentTurn = Color.WHITE;
        this.status = GameStatus.ACTIVE;
        this.boardHistory.add(board.toString() + "|WHITE");
    }

    /**
     * Primary entry point for executing a move.
     * Validates turn order, piece geometry, and king safety before finalizing state changes.
     *
     * @param start Initial position of the piece.
     * @param end Target position.
     * @param promotionType Target piece type if a promotion occurs.
     * @return List of executed moves (includes rook move for castling).
     */
    public List<GameResponse.ExecutedMove> makeMove(Position start, Position end, String promotionType) {
        if (isGameOver()) {
            this.lastMoveMessage = "Game is already over.";
            return List.of();
        }

        return board.getPiece(start)
            .filter(piece -> {
                boolean isCorrectTurn = piece.getColor() == currentTurn;
                if (!isCorrectTurn) this.lastMoveMessage = "It's not your turn!";
                return isCorrectTurn;
            })
            .filter(piece -> {
                boolean isValid = isEnPassantAttempt(piece, end) ? canEnPassant(start, end) : piece.isValidMove(end, board);
                if (!isValid) this.lastMoveMessage = "Invalid move for " + piece.getType().name();
                return isValid;
            })
            .filter(piece -> isMoveSafe(start, end, piece))
            .filter(piece -> {
                if (isPromotionSituation(piece, end)) {
                    boolean hasPromo = promotionType != null && !promotionType.isBlank();
                    if (!hasPromo) this.lastMoveMessage = "Promotion piece type is required.";
                    return hasPromo;
                }
                return true;
            })
            .map(piece -> {
                List<GameResponse.ExecutedMove> moves = new ArrayList<>();
                boolean isCapture = board.getPiece(end).isPresent() || isEnPassantAttempt(piece, end);
                Piece capturedPiece = board.getPiece(end).orElse(null);

                moves.add(new GameResponse.ExecutedMove(
                    start.file(), start.rank(), end.file(), end.rank(), piece.getType().name()
                ));

                if (isCastlingAttempt(piece, start, end)) {
                    int direction = (end.file() > start.file()) ? 1 : -1;
                    int rStartF = (direction == 1) ? 7 : 0;
                    int rEndF = (direction == 1) ? 5 : 3;
                    moves.add(new GameResponse.ExecutedMove(
                        rStartF, start.rank(), rEndF, start.rank(), "ROOK"
                    ));
                }

                executeMove(start, end, piece, promotionType);
                finalizeTurn();

                this.lastMoveMessage = generateMoveMessage(piece, end, isCapture, capturedPiece, promotionType);
                return moves;
            })
            .orElse(List.of());
    }

    /**
     * Calculates all valid destination squares for a piece at a given position.
     * Filters out moves that would result in the king being in check.
     */
    public List<Position> getLegalMovesForSquare(Position start) {
        List<Position> legalPositions = new ArrayList<>();

        return board.getPiece(start)
            .filter(piece -> piece.getColor() == currentTurn)
            .map(piece -> {
                // Optimized scanning for King moves vs other pieces
                int range = (piece.getType() == PieceType.KING) ? 2 : 7;
                for (int f = -range; f <= range; f++) {
                    for (int r = -range; r <= range; r++) {
                        int targetFile = start.file() + f;
                        int targetRank = start.rank() + r;
                        if (isOnBoard(targetFile, targetRank)) {
                            Position target = new Position(targetFile, targetRank);
                            checkAndAddMove(piece, start, target, legalPositions);
                        }
                    }
                }
                return legalPositions;
            })
            .orElse(List.of());
    }

    public void resign(Color color) {
        this.status = GameStatus.RESIGNED;
    }

    // --- State & History Getters ---

    public String getLastMoveMessage() {
        return lastMoveMessage;
    }

    public List<String> getHumanReadableHistory() {
        return new ArrayList<>(humanReadableHistory);
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

    // --- Move Validation Logic ---

    private void checkAndAddMove(Piece piece, Position start, Position target, List<Position> legalPositions) {
        if (start.equals(target)) return;

        boolean isFriendlyFire = board.getPiece(target)
            .map(p -> p.getColor() == piece.getColor())
            .orElse(false);
        if (isFriendlyFire) return;

        boolean isCastling = isCastlingAttempt(piece, start, target);
        boolean isEnPassant = (piece.getType() == PieceType.PAWN && isEnPassantAttempt(piece, target));
        boolean isValidBase = isGeometricMoveValid(piece, target) || isCastling || isEnPassant;

        if (isValidBase && isMoveSafe(start, target, piece)) {
            legalPositions.add(target);
        }
    }

    private boolean isMoveSafe(Position start, Position end, Piece piece) {
        if (isCastlingAttempt(piece, start, end) && !canCastle(start, end)) return false;
        if (isEnPassantAttempt(piece, end) && !canEnPassant(start, end)) return false;

        return simulateAndCheckSafety(start, end, piece);
    }

    /**
     * Temporarily modifies the board to verify if the move leaves the King under attack.
     * Rollback is strictly enforced in the finally block to maintain board integrity.
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

            boolean safe = !isInCheck(piece.getColor());
            if (!safe) this.lastMoveMessage = "Illegal move: King remains in check!";
            return safe;
        } finally {
            board.setPieceAt(start, piece);
            board.setPieceAt(end, targetOriginalPiece);
            if (isEnPassant) board.setPieceAt(lastMove.end(), capturedEnPassant);
            piece.setPosition(originalPosition);
        }
    }

    // --- Execution & State Transition ---

    private void executeMove(Position start, Position end, Piece piece, String promotionType) {
        updateDrawConditions(piece, end);
        board.setPieceAt(start, null);

        if (isCastlingAttempt(piece, start, end)) {
            handleCastlingRookMove(start, end);
        } else if (isEnPassantAttempt(piece, end)) {
            board.setPieceAt(lastMove.end(), null);
        }

        if (isPromotionSituation(piece, end)) {
            Piece promoted = createPromotedPiece(promotionType, piece.getColor(), end);
            board.setPieceAt(end, promoted);
        } else {
            board.setPieceAt(end, piece);
            piece.setPosition(end);
        }

        humanReadableHistory.add(formatMoveNotation(start, end, piece));
        this.lastMove = new Move(start, end, piece);
        piece.setHasMoved(true);
    }

    private void finalizeTurn() {
        switchTurn();
        updateGameStatus();
    }

    private void switchTurn() {
        this.currentTurn = (currentTurn == Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    // --- Status Assessment ---

    private void updateGameStatus() {
        boolean check = isInCheck(currentTurn);
        boolean hasMove = board.findAllPieces().stream()
            .filter(p -> p.getColor() == currentTurn)
            .anyMatch(this::hasAnyLegalMove);

        if (check) {
            this.status = hasMove ? GameStatus.CHECK : GameStatus.CHECKMATE;
        } else {
            if (!hasMove) {
                this.status = GameStatus.STALEMATE;
            } else if (isDraw()) {
                this.status = GameStatus.DRAW;
            } else {
                this.status = GameStatus.ACTIVE;
            }
        }
    }

    public boolean isInCheck(Color color) {
        return isSquareAttacked(findKingPosition(color), getOpponentColor(color));
    }

    /**
     * Determines if a piece can reach a destination via geometric pathing,
     * ignoring the "moving into check" rule.
     */
    private boolean isGeometricMoveValid(Piece p, Position end) {
        Position start = p.getPosition();
        if (start.equals(end)) return false;

        int fileDiff = Math.abs(end.file() - start.file());
        int rankDiff = Math.abs(end.rank() - start.rank());

        return switch (p.getType()) {
            case PAWN -> validatePawnGeometry(p, start, end, fileDiff, rankDiff);
            case KNIGHT -> (fileDiff == 1 && rankDiff == 2) || (fileDiff == 2 && rankDiff == 1);
            case BISHOP -> (fileDiff == rankDiff) && isPathClear(start, end);
            case ROOK -> (start.file() == end.file() || start.rank() == end.rank()) && isPathClear(start, end);
            case QUEEN -> (fileDiff == rankDiff || start.file() == end.file() || start.rank() == end.rank()) && isPathClear(start, end);
            case KING -> (fileDiff <= 1 && rankDiff <= 1);
        };
    }

    private boolean hasAnyLegalMove(Piece piece) {
        Position currentPos = piece.getPosition();
        for (int file = 0; file < 8; file++) {
            for (int rank = 0; rank < 8; rank++) {
                Position target = new Position(file, rank);
                boolean isFriendly = board.getPiece(target).map(p -> p.getColor() == piece.getColor()).orElse(false);
                if (isFriendly) continue;

                boolean canMoveBase = (piece.getType() == PieceType.PAWN)
                    ? piece.isValidMove(target, board)
                    : isGeometricMoveValid(piece, target);

                if (canMoveBase && simulateAndCheckSafety(currentPos, target, piece)) return true;
            }
        }
        return false;
    }

    // --- Special Rules Utilities ---

    private boolean isCastlingAttempt(Piece piece, Position start, Position end) {
        return piece.getType() == PieceType.KING && Math.abs(end.file() - start.file()) == 2;
    }

    private boolean canCastle(Position start, Position end) {
        if (isInCheck(currentTurn)) return false;

        int direction = (end.file() > start.file()) ? 1 : -1;
        int rookFile = (direction == 1) ? 7 : 0;
        Position rookPos = new Position(rookFile, start.rank());

        if (direction == -1 && board.getPiece(new Position(1, start.rank())).isPresent()) return false;

        return board.getPiece(rookPos)
            .filter(p -> p.getType() == PieceType.ROOK && !p.hasMoved())
            .filter(p -> isPathClear(start, rookPos))
            .filter(p -> areCastlingSquaresSafe(currentTurn, start, direction))
            .isPresent();
    }

    private void handleCastlingRookMove(Position kingStart, Position kingEnd) {
        int direction = (kingEnd.file() > kingStart.file()) ? 1 : -1;
        Position rookStart = new Position((direction == 1) ? 7 : 0, kingStart.rank());
        Position rookEnd = new Position((direction == 1) ? 5 : 3, kingStart.rank());

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
        if (lastMove == null || lastMove.piece().getType() != PieceType.PAWN) return false;
        boolean isDoubleStep = Math.abs(lastMove.end().rank() - lastMove.start().rank()) == 2;
        int direction = (currentTurn == Color.WHITE) ? 1 : -1;

        return isDoubleStep &&
            lastMove.end().file() == end.file() &&
            lastMove.end().rank() == start.rank() &&
            end.rank() == start.rank() + direction;
    }

    // --- Helper Utilities ---

    private boolean validatePawnGeometry(Piece p, Position s, Position e, int fDiff, int rDiff) {
        int dir = (p.getColor() == Color.WHITE) ? 1 : -1;
        int startRank = (p.getColor() == Color.WHITE) ? 1 : 6;

        if (e.file() == s.file() && e.rank() - s.rank() == dir) return board.getPiece(e).isEmpty();
        if (e.file() == s.file() && s.rank() == startRank && e.rank() - s.rank() == 2 * dir) {
            return board.getPiece(e).isEmpty() && board.getPiece(new Position(s.file(), s.rank() + dir)).isEmpty();
        }
        if (fDiff == 1 && e.rank() - s.rank() == dir) {
            return board.getPiece(e).isPresent() && board.getPiece(e).get().getColor() != p.getColor();
        }
        return false;
    }

    private boolean isSquareAttacked(Position pos, Color attackerColor) {
        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == attackerColor)
            .anyMatch(p -> {
                if (p.getType() == PieceType.PAWN) {
                    int dir = (p.getColor() == Color.WHITE) ? 1 : -1;
                    return Math.abs(pos.file() - p.getPosition().file()) == 1 && (pos.rank() - p.getPosition().rank() == dir);
                }
                return isGeometricMoveValid(p, pos);
            });
    }

    private boolean isPathClear(Position start, Position end) {
        int fStep = Integer.compare(end.file() - start.file(), 0);
        int rStep = Integer.compare(end.rank() - start.rank(), 0);
        int f = start.file() + fStep;
        int r = start.rank() + rStep;

        while (f != end.file() || r != end.rank()) {
            if (board.getPiece(new Position(f, r)).isPresent()) return false;
            f += fStep;
            r += rStep;
        }
        return true;
    }

    private String generateMoveMessage(Piece p, Position end, boolean isCap, Piece cap, String promo) {
        if (this.status == GameStatus.CHECKMATE) return "CHECKMATE! Game Over.";
        if (this.status == GameStatus.STALEMATE) return "Draw by stalemate.";

        StringBuilder sb = new StringBuilder(p.getType().name());
        if (promo != null) sb.append(" promoted to ").append(promo.toUpperCase());
        else if (isCap) sb.append(" captured ").append(cap != null ? cap.getType().name() : "Pawn");
        else sb.append(" moved to ").append(formatPosition(end));

        if (this.status == GameStatus.CHECK) sb.append(". CHECK!");
        return sb.toString();
    }

    private String formatPosition(Position pos) {
        return (char) ('a' + pos.file()) + String.valueOf(pos.rank() + 1);
    }

    private String formatMoveNotation(Position s, Position e, Piece p) {
        String prefix = switch (p.getType()) {
            case PAWN -> "";
            case KNIGHT -> "N";
            default -> p.getType().name().substring(0, 1);
        };
        return String.format("%s%s%d→%s%d", prefix, (char)('a'+s.file()), s.rank()+1, (char)('a'+e.file()), e.rank()+1);
    }

    private void updateDrawConditions(Piece piece, Position end) {
        if (piece.getType() == PieceType.PAWN || board.getPiece(end).isPresent()) {
            halfMoveClock = 0;
            boardHistory.clear();
        } else {
            halfMoveClock++;
        }
        boardHistory.add(board.toString() + "|" + currentTurn.name());
    }

    private boolean isDraw() {
        if (halfMoveClock >= 100) return true;
        String currentState = board.toString() + "|" + currentTurn.name();
        return boardHistory.stream().filter(s -> s.equals(currentState)).count() >= 3;
    }

    private boolean isGameOver() {
        return status == GameStatus.CHECKMATE || status == GameStatus.STALEMATE || status == GameStatus.DRAW || status == GameStatus.RESIGNED;
    }

    private boolean isOnBoard(int f, int r) {
        return f >= 0 && f < 8 && r >= 0 && r < 8;
    }

    private Position findKingPosition(Color color) {
        return board.findAllPieces().stream()
            .filter(p -> p.getColor() == color && p.getType() == PieceType.KING)
            .map(Piece::getPosition).findFirst()
            .orElseThrow(() -> new IllegalStateException(color + " King missing"));
    }

    private Color getOpponentColor(Color c) {
        return (c == Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    private boolean areCastlingSquaresSafe(Color c, Position s, int dir) {
        for (int i = 1; i <= 2; i++) {
            if (isSquareAttacked(new Position(s.file() + (i * dir), s.rank()), getOpponentColor(c))) return false;
        }
        return true;
    }

    private Piece createPromotedPiece(String type, Color color, Position pos) {
        return switch (type.toUpperCase()) {
            case "QUEEN" -> new Queen(color, pos);
            case "ROOK" -> new Rook(color, pos);
            case "BISHOP" -> new Bishop(color, pos);
            case "KNIGHT" -> new Knight(color, pos);
            default -> throw new IllegalArgumentException("Invalid promotion: " + type);
        };
    }

    private boolean isPromotionSituation(Piece piece, Position end) {
        if (piece.getType() != PieceType.PAWN) return false;
        return end.rank() == ((piece.getColor() == Color.WHITE) ? WHITE_PROMOTION_RANK : BLACK_PROMOTION_RANK);
    }

    public record Move(Position start, Position end, Piece piece) {}
}
