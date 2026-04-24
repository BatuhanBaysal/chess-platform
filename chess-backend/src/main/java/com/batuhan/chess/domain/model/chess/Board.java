package com.batuhan.chess.domain.model.chess;

import lombok.Getter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class Board {

    @Getter
    private final Piece[][] squares;

    public Board() {
        this(true);
    }

    public Board(boolean fillBoard) {
        this.squares = new Piece[8][8];
        if (fillBoard) {
            initializeBoard();
        }
    }

    public Optional<Piece> getPiece(Position position) {
        return Optional.ofNullable(squares[position.rank()][position.file()]);
    }

    public void setPieceAt(Position position, Piece piece) {
        squares[position.rank()][position.file()] = piece;
        if (piece != null) {
            piece.updatePositionWithoutMoving(position);
        }
    }

    public void removePiece(Position position) {
        squares[position.rank()][position.file()] = null;
    }

    public List<Piece> findAllPieces() {
        List<Piece> allPieces = new ArrayList<>();
        for (int r = 0; r < 8; r++) {
            for (int f = 0; f < 8; f++) {
                if (squares[r][f] != null) {
                    allPieces.add(squares[r][f]);
                }
            }
        }
        return allPieces;
    }

    public List<Piece> findPiecesByColor(Color color) {
        return findAllPieces().stream()
            .filter(p -> p.getColor() == color)
            .toList();
    }

    public Optional<Piece> findKing(Color color) {
        return findAllPieces().stream()
            .filter(p -> p.getType() == PieceType.KING && p.getColor() == color)
            .findFirst();
    }

    public Board copy() {
        Board newBoard = new Board(false);
        for (int r = 0; r < 8; r++) {
            for (int f = 0; f < 8; f++) {
                Piece original = this.squares[r][f];
                if (original != null) {
                    Position pos = new Position(f, r);
                    Piece copyPiece = createPieceCopy(original, pos);
                    copyPiece.setHasMoved(original.hasMoved());
                    newBoard.setPieceAt(pos, copyPiece);
                    copyPiece.setHasMoved(original.hasMoved());
                }
            }
        }
        return newBoard;
    }

    public void clearBoard() {
        for (int r = 0; r < 8; r++) {
            for (int f = 0; f < 8; f++) {
                squares[r][f] = null;
            }
        }
    }

    private Piece createPieceCopy(Piece p, Position pos) {
        return switch (p.getType()) {
            case PAWN -> new Pawn(p.getColor(), pos);
            case KNIGHT -> new Knight(p.getColor(), pos);
            case BISHOP -> new Bishop(p.getColor(), pos);
            case ROOK -> new Rook(p.getColor(), pos);
            case QUEEN -> new Queen(p.getColor(), pos);
            case KING -> new King(p.getColor(), pos);
            default -> throw new IllegalArgumentException("Unexpected piece type: " + p.getType());
        };
    }

    private void initializeBoard() {
        setupMajorPieces(Color.BLACK, 7);
        setupMajorPieces(Color.WHITE, 0);
        setupPawns(Color.BLACK, 6);
        setupPawns(Color.WHITE, 1);
        findAllPieces().forEach(p -> p.setHasMoved(false));
    }

    private void setupMajorPieces(Color color, int rank) {
        setPieceAt(new Position(0, rank), new Rook(color, new Position(0, rank)));
        setPieceAt(new Position(1, rank), new Knight(color, new Position(1, rank)));
        setPieceAt(new Position(2, rank), new Bishop(color, new Position(2, rank)));
        setPieceAt(new Position(3, rank), new Queen(color, new Position(3, rank)));
        setPieceAt(new Position(4, rank), new King(color, new Position(4, rank)));
        setPieceAt(new Position(5, rank), new Bishop(color, new Position(5, rank)));
        setPieceAt(new Position(6, rank), new Knight(color, new Position(6, rank)));
        setPieceAt(new Position(7, rank), new Rook(color, new Position(7, rank)));
    }

    private void setupPawns(Color color, int rank) {
        for (int file = 0; file < 8; file++) {
            setPieceAt(new Position(file, rank), new Pawn(color, new Position(file, rank)));
        }
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        for (int r = 7; r >= 0; r--) {
            for (int f = 0; f < 8; f++) {
                getPiece(new Position(f, r)).ifPresentOrElse(
                    p -> sb.append(p.getColor() == Color.WHITE ? p.getType().getSymbol() : Character.toLowerCase(p.getType().getSymbol())),
                    () -> sb.append('.')
                );
            }
        }
        return sb.toString();
    }
}
