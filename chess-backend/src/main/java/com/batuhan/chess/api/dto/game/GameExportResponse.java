package com.batuhan.chess.api.dto.game;

public record GameExportResponse(
    String gameId,
    String storageKey,
    String fileName,
    long sizeInBytes
) {}
