package com.batuhan.chess.api.dto.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AvatarUploadResponse Record Tests")
class AvatarUploadResponseTest {

    private AvatarUploadResponse createSampleResponse(String url, String message) {
        return new AvatarUploadResponse(url, message);
    }

    @Nested
    @DisplayName("Field Accessors")
    class FieldAccessorTests {

        @Test
        @DisplayName("Should initialize fields correctly and return matching values")
        void shouldInitializeFieldsCorrectly() {
            // Arrange
            String avatarUrl = "/api/users/batuhan/avatar";
            String message = "Avatar uploaded successfully";

            // Act
            AvatarUploadResponse response = new AvatarUploadResponse(avatarUrl, message);

            // Assert
            assertThat(response.avatarUrl()).isEqualTo(avatarUrl);
            assertThat(response.message()).isEqualTo(message);
        }
    }

    @Nested
    @DisplayName("Equality and HashCode Contract")
    class EqualityTests {

        @Test
        @DisplayName("Should verify equality and hash code consistency")
        void shouldVerifyEqualityAndHashCode() {
            // Arrange
            AvatarUploadResponse response1 = createSampleResponse("/url/1", "OK");
            AvatarUploadResponse response2 = createSampleResponse("/url/1", "OK");
            AvatarUploadResponse differentResponse = createSampleResponse("/url/2", "Failed");

            // Act & Assert
            assertThat(response1)
                .isEqualTo(response2)
                .hasSameHashCodeAs(response2)
                .isNotEqualTo(differentResponse);
        }
    }

    @Nested
    @DisplayName("String Representation")
    class ToStringTests {

        @Test
        @DisplayName("Should include field values in toString output")
        void shouldContainFieldValuesInToString() {
            // Arrange
            AvatarUploadResponse response = new AvatarUploadResponse("/url/test", "Success");

            // Act
            String result = response.toString();

            // Assert
            assertThat(result)
                .contains("avatarUrl=/url/test")
                .contains("message=Success");
        }
    }
}
