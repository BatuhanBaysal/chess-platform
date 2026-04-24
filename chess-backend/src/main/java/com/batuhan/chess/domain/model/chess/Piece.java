package com.batuhan.chess.domain.model.chess;

import lombok.Getter;
import lombok.Setter;
import java.util.Objects;
import java.util.List;

@Getter
public abstract sealed class Piece
    permits Pawn, Knight, Bishop, Rook, Queen, King {

    protected final Color color;
    protected final PieceType type;
    protected Position position;

    @Setter
    protected boolean hasMoved = false;

    protected Piece(Color color, PieceType type, Position position) {
        this.color = color;
        this.type = type;
        this.position = position;
    }

    public abstract boolean isPseudoLegalMove(Position target, Board board);

    public abstract List<Position> getPseudoLegalMoves(Board board);

    protected boolean canCaptureOrMoveTo(Position target, Board board) {
        return board.getPiece(target)
            .map(p -> p.getColor() != this.color)
            .orElse(true);
    }

    protected boolean isPathClear(Position target, Board board) {
        int fileDiff = target.file() - position.file();
        int rankDiff = target.rank() - position.rank();

        int fileStep = Integer.compare(fileDiff, 0);
        int rankStep = Integer.compare(rankDiff, 0);

        int currFile = position.file() + fileStep;
        int currRank = position.rank() + rankStep;

        while (currFile != target.file() || currRank != target.rank()) {
            if (board.getPiece(new Position(currFile, currRank)).isPresent()) {
                return false;
            }
            currFile += fileStep;
            currRank += rankStep;
        }
        return true;
    }

    protected void addMovesInDirection(List<Position> moves, int[] direction, Board board) {
        int i = 1;
        boolean keepGoing = true;

        while (i < 8 && keepGoing) {
            int newFile = position.file() + (direction[0] * i);
            int newRank = position.rank() + (direction[1] * i);

            if (!Position.isValidPosition(newFile, newRank)) {
                keepGoing = false;
            } else {
                Position target = new Position(newFile, newRank);
                java.util.Optional<Piece> pieceAtTarget = board.getPiece(target);

                if (pieceAtTarget.isEmpty()) {
                    moves.add(target);
                } else {
                    if (pieceAtTarget.get().getColor() != this.color) {
                        moves.add(target);
                    }
                    keepGoing = false;
                }
            }
            i++;
        }
    }

    public void updatePositionWithoutMoving(Position position) {
        this.position = position;
    }

    public boolean hasMoved() {
        return hasMoved;
    }

    public void setPosition(Position position) {
        this.position = position;
        this.hasMoved = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Piece piece)) return false;
        return color == piece.color && type == piece.type;
    }

    @Override
    public int hashCode() {
        return Objects.hash(color, type);
    }
}
