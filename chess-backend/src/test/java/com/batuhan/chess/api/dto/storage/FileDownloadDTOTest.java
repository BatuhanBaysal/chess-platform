package com.batuhan.chess.api.dto.storage;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("FileDownloadDTO Record Tests")
class FileDownloadDTOTest {

    @Test
    @DisplayName("Should initialize fields correctly and return matching values")
    void shouldInitializeFieldsCorrectly() {
        // Arrange
        byte[] data = "dummy byte payload".getBytes();
        String contentType = "application/x-chess-pgn";
        String fileName = "match-123.pgn";

        // Act
        FileDownloadDTO dto = new FileDownloadDTO(data, contentType, fileName);

        // Assert
        assertArrayEquals(data, dto.data());
        assertEquals(contentType, dto.contentType());
        assertEquals(fileName, dto.fileName());
    }

    @Test
    @DisplayName("Should verify equality and hash code consistency")
    void shouldVerifyEqualityAndHashCode() {
        // Arrange
        byte[] data = new byte[]{1, 2, 3};
        FileDownloadDTO dto1 = new FileDownloadDTO(data, "image/png", "avatar.png");
        FileDownloadDTO dto2 = new FileDownloadDTO(data, "image/png", "avatar.png");
        FileDownloadDTO differentDto = new FileDownloadDTO(data, "image/jpeg", "avatar.jpg");

        // Act & Assert
        assertEquals(dto1, dto2);
        assertEquals(dto1.hashCode(), dto2.hashCode());
        assertNotEquals(dto1, differentDto);
    }

    @Test
    @DisplayName("Should include field values in toString output")
    void shouldContainFieldValuesInToString() {
        // Arrange
        FileDownloadDTO dto = new FileDownloadDTO(new byte[0], "text/plain", "file.txt");

        // Act
        String result = dto.toString();

        // Assert
        assertTrue(result.contains("contentType=text/plain"));
        assertTrue(result.contains("fileName=file.txt"));
    }
}
