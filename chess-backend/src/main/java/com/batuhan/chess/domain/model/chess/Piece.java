package com.batuhan.chess.domain.model.chess;

/**
 * Abstract base class for all chess pieces.
 * Uses a sealed hierarchy to strictly control piece types.
 */
public abstract sealed class Piece
    permits Pawn, Knight, Bishop, Rook, Queen, King {

    protected final Color color;
    protected final PieceType type;
    protected Position position;
    protected boolean hasMoved = false;

    protected Piece(Color color, PieceType type, Position position) {
        this.color = color;
        this.type = type;
        this.position = position;
    }

    public Color getColor() {
        return color;
    }

    public PieceType getType() {
        return type;
    }

    public Position getPosition() {
        return position;
    }

    public boolean hasMoved() {
        return hasMoved;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public void setHasMoved(boolean hasMoved) {
        this.hasMoved = hasMoved;
    }

    /**
     * Validates if the path between current position and target is empty.
     * Does not check the target square itself.
     */
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

    /**
     * Defines the movement strategy for the specific piece type.
     */
    public abstract boolean isValidMove(Position targetPosition, Board board);
}
