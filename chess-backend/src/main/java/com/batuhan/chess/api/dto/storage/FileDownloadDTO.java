package com.batuhan.chess.api.dto.storage;

import org.springframework.lang.NonNull;

import java.util.Arrays;
import java.util.Objects;

public record FileDownloadDTO(
    byte[] data,
    String contentType,
    String fileName
) {
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FileDownloadDTO that)) return false;
        return Arrays.equals(data, that.data) &&
            Objects.equals(contentType, that.contentType) &&
            Objects.equals(fileName, that.fileName);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(contentType, fileName);
        result = 31 * result + Arrays.hashCode(data);
        return result;
    }

    @Override
    @NonNull
    public String toString() {
        return "FileDownloadDTO[" +
            "dataLength=" + (data != null ? data.length : 0) +
            ", contentType=" + contentType +
            ", fileName=" + fileName + ']';
    }
}
