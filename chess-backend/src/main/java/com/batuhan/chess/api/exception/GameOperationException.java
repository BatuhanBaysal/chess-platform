package com.batuhan.chess.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class GameOperationException extends RuntimeException {

    public GameOperationException(String message) {
        super(message);
    }

    public GameOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
