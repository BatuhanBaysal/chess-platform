package com.batuhan.chess.domain.repository;

import java.io.InputStream;

public interface FileStoragePort {

    String uploadFile(String key, InputStream inputStream, long contentLength, String contentType);

    byte[] downloadFile(String key);

    void deleteFile(String key);

    boolean doesFileExist(String key);
}
