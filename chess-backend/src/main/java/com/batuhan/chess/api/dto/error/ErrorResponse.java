package com.batuhan.chess.api.dto.error;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

public record ErrorResponse(
    int status,
    String message,
    String path,
    LocalDateTime timestamp,
    Map<String, String> validationErrors
) {
    public ErrorResponse(int status, String message, String path) {
        this(status, message, path, LocalDateTime.now(ZoneId.of("UTC")), null);
    }
}
