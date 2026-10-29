package com.batuhan.chess.api.dto.storage;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FileDownloadDTO Record Tests")
class FileDownloadDTOTest {

    @Nested
    @DisplayName("Field Accessors")
    class FieldAccessorTests {

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
            assertThat(dto.data()).isEqualTo(data);
            assertThat(dto.contentType()).isEqualTo(contentType);
            assertThat(dto.fileName()).isEqualTo(fileName);
        }
    }

    @Nested
    @DisplayName("Equality and HashCode Contract")
    class EqualityTests {

        @Test
        @DisplayName("Should verify equality and hash code consistency across matching and distinct instances")
        void shouldVerifyEqualityAndHashCode() {
            // Arrange
            byte[] data1 = new byte[]{1, 2, 3};
            byte[] data2 = new byte[]{1, 2, 3};
            byte[] differentData = new byte[]{4, 5, 6};

            FileDownloadDTO dto1 = new FileDownloadDTO(data1, "image/png", "avatar.png");
            FileDownloadDTO dto2 = new FileDownloadDTO(data2, "image/png", "avatar.png");
            FileDownloadDTO differentContent = new FileDownloadDTO(data1, "image/jpeg", "avatar.png");
            FileDownloadDTO differentName = new FileDownloadDTO(data1, "image/png", "other.png");
            FileDownloadDTO differentBytes = new FileDownloadDTO(differentData, "image/png", "avatar.png");

            // Act & Assert
            assertThat(dto1)
                .isEqualTo(dto2)
                .hasSameHashCodeAs(dto2)
                .isNotEqualTo(differentContent)
                .isNotEqualTo(differentName)
                .isNotEqualTo(differentBytes);

            // Act & Assert
            assertThat(areEqual(dto1, dto1)).isTrue();
            assertThat(areEqual(dto1, "non-dto-object")).isFalse();
            assertThat(areEqual(dto1, null)).isFalse();
        }

        private boolean areEqual(Object a, Object b) {
            return a != null && a.equals(b);
        }
    }

    @Nested
    @DisplayName("String Representation")
    class ToStringTests {

        @Test
        @DisplayName("Should format toString with data length when data is present")
        void shouldFormatToStringWithDataLength() {
            // Arrange
            FileDownloadDTO dto = new FileDownloadDTO(new byte[10], "text/plain", "file.txt");

            // Act
            String result = dto.toString();

            // Assert
            assertThat(result)
                .contains("dataLength=10")
                .contains("contentType=text/plain")
                .contains("fileName=file.txt");
        }

        @Test
        @DisplayName("Should format toString with zero length when data is null")
        void shouldFormatToStringWhenDataIsNull() {
            // Arrange
            FileDownloadDTO dto = new FileDownloadDTO(null, "text/plain", "empty.txt");

            // Act
            String result = dto.toString();

            // Assert
            assertThat(result)
                .contains("dataLength=0")
                .contains("fileName=empty.txt");
        }
    }
}
