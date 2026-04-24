package com.batuhan.chess.domain.model.chess;

import com.batuhan.chess.api.dto.game.GameResponse;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Getter
@Setter
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

    public Game(Board board) {
        this.board = board;
        this.currentTurn = Color.WHITE;
        this.status = GameStatus.ACTIVE;
        this.boardHistory.add(board.toString() + "|WHITE");
    }

    public synchronized List<GameResponse.ExecutedMove> makeMove(Position start, Position end, String promotionType) {
        if (status.isFinished()) {
            return List.of();
        }

        if (!validator.isMoveLegal(start, end, board, currentTurn, this.lastMove)) {
            updateErrorMessage(currentTurn);
            return List.of();
        }

        Piece piece = board.getPiece(start).orElseThrow();
        boolean isEnPassant = validator.isEnPassantAttempt(piece, end, board);
        boolean isCapture = board.getPiece(end).isPresent() || isEnPassant;

        List<GameResponse.ExecutedMove> executedMoves = prepareExecutedMoves(start, end, piece, promotionType);
        executor.execute(start, end, piece, promotionType, board, validator);

        updateDrawMetrics(piece, isCapture);
        recordMove(start, end, piece, isCapture);

        this.lastMove = new Move(start, end, piece);
        this.currentTurn = currentTurn.opposite();
        this.status = evaluator.evaluateStatus(board, currentTurn, validator, halfMoveClock, boardHistory, this.lastMove);
        this.lastMoveMessage = generateMoveMessage(piece, end, isCapture);
        return executedMoves;
    }

    private void updateErrorMessage(Color color) {
        this.lastMoveMessage = validator.isInCheck(color, board) ? "Invalid move: King in check!" : "Illegal move.";
    }

    public synchronized List<Position> getLegalMovesForSquare(Position start) {
        return board.getPiece(start)
            .filter(p -> p.getColor() == currentTurn)
            .map(p -> p.getPseudoLegalMoves(board).stream()
                .filter(target -> validator.isMoveLegal(start, target, board, currentTurn, lastMove))
                .toList())
            .orElse(List.of());
    }

    private List<GameResponse.ExecutedMove> prepareExecutedMoves(Position start, Position end, Piece piece, String promotionType) {
        List<GameResponse.ExecutedMove> moves = new ArrayList<>();
        String pieceName = (promotionType != null && validator.isPromotionSituation(piece, end))
            ? promotionType.toUpperCase() : piece.getType().name();

        moves.add(new GameResponse.ExecutedMove(start.file(), start.rank(), end.file(), end.rank(), pieceName));

        if (validator.isCastlingAttempt(piece, start, end)) {
            int dir = (end.file() > start.file()) ? 1 : -1;
            int rookStartFile = (dir == 1) ? 7 : 0;
            int rookEndFile = (dir == 1) ? 5 : 3;
            moves.add(new GameResponse.ExecutedMove(rookStartFile, start.rank(), rookEndFile, start.rank(), "ROOK"));
        }

        if (validator.isEnPassantAttempt(piece, end, board)) {
            moves.add(new GameResponse.ExecutedMove(end.file(), start.rank(), -1, -1, "NONE"));
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

    private void recordMove(Position s, Position e, Piece p, boolean isCap) {
        String notation = String.format("%s%s%s%s", p.getType().getSymbol(), s, isCap ? "x" : "→", e);
        moveHistory.add(s.toString() + e.toString());
        humanReadableHistory.add(notation);
    }

    private String generateMoveMessage(Piece p, Position end, boolean isCap) {
        if (status == GameStatus.CHECKMATE) return "CHECKMATE!";
        if (status == GameStatus.STALEMATE || status == GameStatus.DRAW) return "DRAW!";
        if (status == GameStatus.CHECK) return "CHECK!";
        return p.getColor() + " " + p.getType().name() + (isCap ? " captured at " : " moved to ") + end;
    }

    public record Move(Position start, Position end, Piece piece) {}
}
