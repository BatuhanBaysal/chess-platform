package com.batuhan.chess.api.controller;

import com.batuhan.chess.application.service.game.LobbyService;
import com.batuhan.chess.application.service.auth.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web layer unit tests for LobbyController.
 * Validates match-making processes, including room creation, player joining logic,
 * and retrieval of active game room statuses.
 */
@WebMvcTest(LobbyController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Lobby Controller Web Layer Tests")
class LobbyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LobbyService lobbyService;

    @MockitoBean
    private JwtService jwtService;

    @Nested
    @DisplayName("Room Management Operations")
    class RoomManagementTests {

        @Test
        @DisplayName("Should return generated room ID when a new room is created successfully")
        void shouldCreateRoomSuccessfully() throws Exception {
            // Arrange
            String mockRoomId = "room1234";
            when(lobbyService.createRoom(anyLong(), anyString(), anyInt())).thenReturn(mockRoomId);

            // Act & Assert
            mockMvc.perform(post("/api/lobby/create")
                    .param("userId", "1")
                    .param("username", "batuhan")
                    .param("time", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string(mockRoomId));
        }

        @Test
        @DisplayName("Should return 200 OK and true when a player joins an existing room")
        void shouldJoinRoomSuccessfully() throws Exception {
            // Arrange
            when(lobbyService.joinRoom(anyString(), anyLong(), anyString())).thenReturn(true);

            // Act & Assert
            mockMvc.perform(post("/api/lobby/join")
                    .param("roomId", "room1234")
                    .param("userId", "2")
                    .param("username", "opponent")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when joining a room fails (e.g., room is full)")
        void shouldReturnBadRequestWhenJoinFails() throws Exception {
            // Arrange
            when(lobbyService.joinRoom(anyString(), anyLong(), anyString())).thenReturn(false);

            // Act & Assert
            mockMvc.perform(post("/api/lobby/join")
                    .param("roomId", "full-room")
                    .param("userId", "3")
                    .param("username", "tester"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("false"));
        }
    }

    @Nested
    @DisplayName("Lobby Data Retrieval")
    class DataRetrievalTests {

        @Test
        @DisplayName("Should return a list of all active game rooms with their current status")
        void shouldReturnListOfActiveRooms() throws Exception {
            // Arrange
            LobbyService.GameRoom room = new LobbyService.GameRoom();
            room.setRoomId("room1");
            room.setStatus("WAITING");

            when(lobbyService.getAllActiveRooms()).thenReturn(List.of(room));

            // Act & Assert
            mockMvc.perform(get("/api/lobby/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roomId").value("room1"))
                .andExpect(jsonPath("$[0].status").value("WAITING"));
        }

        @Test
        @DisplayName("Should return specific room details when a valid room ID is provided")
        void shouldReturnRoomStatusSuccessfully() throws Exception {
            // Arrange
            LobbyService.GameRoom room = new LobbyService.GameRoom();
            room.setRoomId("test-room");
            when(lobbyService.getRoom("test-room")).thenReturn(room);

            // Act & Assert
            mockMvc.perform(get("/api/lobby/status/test-room"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value("test-room"));
        }

        @Test
        @DisplayName("Should return 404 Not Found when requesting status of a non-existent room")
        void shouldReturnNotFoundForInvalidRoom() throws Exception {
            // Arrange
            when(lobbyService.getRoom("invalid-id")).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/api/lobby/status/invalid-id"))
                .andExpect(status().isNotFound());
        }
    }
}
