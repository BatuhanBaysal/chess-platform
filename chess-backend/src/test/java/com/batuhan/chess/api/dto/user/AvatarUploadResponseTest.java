package com.batuhan.chess.api.dto.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AvatarUploadResponse Record Tests")
class AvatarUploadResponseTest {

    @Test
    @DisplayName("Should initialize fields correctly and return matching values")
    void shouldInitializeFieldsCorrectly() {
        // Arrange
        String avatarUrl = "/api/users/batuhan/avatar";
        String message = "Avatar uploaded successfully";

        // Act
        AvatarUploadResponse response = new AvatarUploadResponse(avatarUrl, message);

        // Assert
        assertEquals(avatarUrl, response.avatarUrl());
        assertEquals(message, response.message());
    }

    @Test
    @DisplayName("Should verify equality and hash code consistency")
    void shouldVerifyEqualityAndHashCode() {
        // Arrange
        AvatarUploadResponse response1 = new AvatarUploadResponse("/url/1", "OK");
        AvatarUploadResponse response2 = new AvatarUploadResponse("/url/1", "OK");
        AvatarUploadResponse differentResponse = new AvatarUploadResponse("/url/2", "Failed");

        // Act & Assert
        assertEquals(response1, response2);
        assertEquals(response1.hashCode(), response2.hashCode());
        assertNotEquals(response1, differentResponse);
    }

    @Test
    @DisplayName("Should include field values in toString output")
    void shouldContainFieldValuesInToString() {
        // Arrange
        AvatarUploadResponse response = new AvatarUploadResponse("/url/test", "Success");

        // Act
        String result = response.toString();

        // Assert
        assertTrue(result.contains("avatarUrl=/url/test"));
        assertTrue(result.contains("message=Success"));
    }
}
