package com.batuhan.chess.domain.model.chess;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Getter
public class Game {

    private final Board board;
    private final MoveValidator validator = new MoveValidator();
    private final MoveExecutor executor = new MoveExecutor();
    private final GameStateEvaluator evaluator = new GameStateEvaluator();

    private final List<String> boardHistory = new ArrayList<>();
    private final List<String> humanReadableHistory = new ArrayList<>();
    private final List<String> moveHistory = new ArrayList<>();

    private Long whitePlayerId;
    private Long blackPlayerId;
    private Color currentTurn;
    private GameStatus status;
    private Move lastMove;
    private int halfMoveClock = 0;
    private String lastMoveMessage = "Game started. White to move.";

    private String whitePlayerName;
    private String blackPlayerName;
    private Integer aiDifficulty;

    private long whiteRemainingTimeMs;
    private long blackRemainingTimeMs;
    private Long lastMoveTimestamp;

    private int timeLimit = 10;

    public Game(Board board) {
        this.board = board;
        this.currentTurn = Color.WHITE;
        this.status = GameStatus.ACTIVE;
        this.boardHistory.add(board.toString() + "|WHITE");
    }

    public synchronized void setPlayerNames(String whitePlayerName, String blackPlayerName) {
        this.whitePlayerName = whitePlayerName;
        this.blackPlayerName = blackPlayerName;
    }

    public synchronized void setAiDifficulty(Integer aiDifficulty) {
        this.aiDifficulty = aiDifficulty;
    }

    public synchronized void setWhitePlayerId(Long whitePlayerId) {
        this.whitePlayerId = whitePlayerId;
    }

    public synchronized void setBlackPlayerId(Long blackPlayerId) {
        this.blackPlayerId = blackPlayerId;
    }

    public synchronized void setRemainingTimes(long whiteMs, long blackMs) {
        this.whiteRemainingTimeMs = Math.max(0, whiteMs);
        this.blackRemainingTimeMs = Math.max(0, blackMs);
    }

    public synchronized void setStatus(GameStatus status) {
        this.status = status;
    }

    public synchronized void setTimeLimit(int timeLimit) {
        this.timeLimit = timeLimit;
    }

    public synchronized void setHalfMoveClock(int halfMoveClock) {
        this.halfMoveClock = halfMoveClock;
    }

    public synchronized List<ExecutedMoveData> makeMove(Position start, Position end, String promotionType) {
        if (status.isFinished()) {
            return List.of();
        }

        updateTime();

        if (whiteRemainingTimeMs <= 0 || blackRemainingTimeMs <= 0) {
            this.status = GameStatus.TIMEOUT;
            this.lastMoveMessage = "Game Over: Time out!";
            return List.of();
        }

        if (!validator.isMoveLegal(start, end, board, currentTurn, this.lastMove, promotionType)) {
            updateErrorMessage(currentTurn);
            return List.of();
        }

        Piece piece = board.getPiece(start).orElseThrow();
        boolean isEnPassant = validator.isEnPassantAttempt(piece, end, board);
        boolean isCastling = validator.isCastlingAttempt(piece, start, end);
        boolean isCapture = board.getPiece(end).isPresent() || isEnPassant;
        String validPromotion = (validator.isPromotionSituation(piece, end) && promotionType != null && !promotionType.isBlank())
            ? promotionType
            : null;

        List<ExecutedMoveData> executedMoves = prepareExecutedMoves(start, end, piece, validPromotion);
        executor.execute(start, end, piece, validPromotion, board, validator);

        updateDrawMetrics(piece, isCapture);
        recordMove(start, end, piece, isCapture, validPromotion);

        this.lastMove = new Move(start, end, piece);
        this.currentTurn = currentTurn.opposite();
        this.lastMoveTimestamp = System.currentTimeMillis();

        this.status = evaluator.evaluateStatus(board, currentTurn, validator, halfMoveClock, boardHistory, this.lastMove);

        if (whiteRemainingTimeMs <= 0 || blackRemainingTimeMs <= 0) {
            this.status = GameStatus.TIMEOUT;
        }

        this.lastMoveMessage = generateMoveMessage(piece, start, end, isCapture, isEnPassant, isCastling, validPromotion);
        return executedMoves;
    }

    public synchronized List<Position> getLegalMovesForSquare(Position start) {
        return board.getPiece(start)
            .filter(p -> p.getColor() == currentTurn)
            .map(p -> p.getPseudoLegalMoves(board).stream()
                .filter(target -> validator.isMoveLegal(start, target, board, currentTurn, lastMove))
                .toList())
            .orElse(List.of());
    }

    public synchronized void updateTime() {
        if (lastMoveTimestamp == null || status.isFinished()) return;
        long now = System.currentTimeMillis();
        long elapsed = now - lastMoveTimestamp;

        if (currentTurn == Color.WHITE) {
            whiteRemainingTimeMs = Math.max(0, whiteRemainingTimeMs - elapsed);
        } else {
            blackRemainingTimeMs = Math.max(0, blackRemainingTimeMs - elapsed);
        }
        this.lastMoveTimestamp = now;
    }

    public synchronized void startClock(int timeLimitMinutes) {
        this.timeLimit = timeLimitMinutes;
        long timeLimitMs = (long) timeLimitMinutes * 60 * 1000;
        this.whiteRemainingTimeMs = timeLimitMs;
        this.blackRemainingTimeMs = timeLimitMs;
        this.lastMoveTimestamp = System.currentTimeMillis();
    }

    public boolean isAiGame() {
        return (this.whitePlayerId != null && this.whitePlayerId.equals(-1L)) ||
            (this.blackPlayerId != null && this.blackPlayerId.equals(-1L));
    }

    private void updateErrorMessage(Color color) {
        this.lastMoveMessage = validator.isInCheck(color, board) ? "Invalid move: King in check!" : "Illegal move.";
    }

    private List<ExecutedMoveData> prepareExecutedMoves(Position start, Position end, Piece piece, String promotionType) {
        List<ExecutedMoveData> moves = new ArrayList<>();
        String pieceName = (promotionType != null && validator.isPromotionSituation(piece, end))
            ? promotionType.toUpperCase() : piece.getType().name();

        moves.add(new ExecutedMoveData(start.file(), start.rank(), end.file(), end.rank(), pieceName));

        if (validator.isCastlingAttempt(piece, start, end)) {
            int dir = (end.file() > start.file()) ? 1 : -1;
            int rookStartFile = (dir == 1) ? 7 : 0;
            int rookEndFile = (dir == 1) ? 5 : 3;
            moves.add(new ExecutedMoveData(rookStartFile, start.rank(), rookEndFile, start.rank(), "ROOK"));
        }

        if (validator.isEnPassantAttempt(piece, end, board)) {
            moves.add(new ExecutedMoveData(end.file(), start.rank(), -1, -1, "NONE"));
        }
        return moves;
    }

    private void updateDrawMetrics(Piece piece, boolean isCapture) {
        if (piece.getType() == PieceType.PAWN || isCapture) {
            halfMoveClock = 0;
            boardHistory.clear();
        } else {
            halfMoveClock++;
        }
        boardHistory.add(board.toString() + "|" + currentTurn.opposite().name());
    }

    private void recordMove(Position s, Position e, Piece p, boolean isCap, String promotionType) {
        String notation = String.valueOf(p.getType().getSymbol()) + s + (isCap ? "x" : "→") + e;
        String uciMove = s.toString() + e.toString();
        if (validator.isPromotionSituation(p, e) && promotionType != null && !promotionType.isBlank()) {
            uciMove += promotionType.toLowerCase(java.util.Locale.ROOT).substring(0, 1);
        }

        moveHistory.add(uciMove);
        humanReadableHistory.add(notation);
    }

    private String generateMoveMessage(Piece p, Position start, Position end, boolean isCap,
                                       boolean isEnPassant, boolean isCastling, String promotionType) {
        if (status == GameStatus.TIMEOUT) return "Game Over: Time out!";
        if (status == GameStatus.STALEMATE) return "DRAW by Stalemate!";
        if (status == GameStatus.DRAW) return "DRAW!";

        String baseAction;
        if (isCastling) {
            boolean isKingside = end.file() > start.file();
            baseAction = p.getColor() + " executed " + (isKingside ? "Kingside Castling (O-O)" : "Queenside Castling (O-O-O)");
        } else if (isEnPassant) {
            baseAction = p.getColor() + " PAWN captured at " + end + " via En Passant (e.p.)";
        } else if (promotionType != null && !promotionType.isBlank()) {
            baseAction = p.getColor() + " PAWN promoted to " + promotionType.toUpperCase() + " at " + end;
        } else if (isCap) {
            baseAction = p.getColor() + " " + p.getType().name() + " captured at " + end;
        } else {
            baseAction = p.getColor() + " " + p.getType().name() + " moved to " + end;
        }

        if (status == GameStatus.CHECKMATE) {
            return baseAction + " - CHECKMATE!";
        }
        if (status == GameStatus.CHECK) {
            return baseAction + " - CHECK!";
        }
        return baseAction;
    }

    public record Move(Position start, Position end, Piece piece) {}

    public record ExecutedMoveData(int startFile, int startRank, int endFile, int endRank, String pieceType) {}
}
