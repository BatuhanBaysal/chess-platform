package com.batuhan.chess.api.dto.storage;

public record FileDownloadDTO(
    byte[] data,
    String contentType,
    String fileName
) {}
