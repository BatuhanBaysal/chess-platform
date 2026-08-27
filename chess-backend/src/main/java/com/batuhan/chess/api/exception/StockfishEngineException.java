package com.batuhan.chess.api.exception;

public class StockfishEngineException extends RuntimeException {

    public StockfishEngineException(String message) {
        super(message);
    }

    public StockfishEngineException(String message, Throwable cause) {
        super(message, cause);
    }
}
