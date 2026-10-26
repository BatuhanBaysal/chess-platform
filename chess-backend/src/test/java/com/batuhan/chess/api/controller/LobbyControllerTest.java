package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.lobby.CreateRoomRequest;
import com.batuhan.chess.api.dto.lobby.GameRoomResponse;
import com.batuhan.chess.api.dto.lobby.JoinRoomRequest;
import com.batuhan.chess.api.exception.GlobalExceptionHandler;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.application.service.game.LobbyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LobbyController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("Lobby Controller Web Layer Tests")
class LobbyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LobbyService lobbyService;

    @Nested
    @DisplayName("Room Management Operations")
    class RoomManagementTests {

        @Test
        @DisplayName("Should return generated room ID when a new room is created successfully")
        void shouldCreateRoomSuccessfully() throws Exception {
            // Arrange
            String mockRoomId = "room1234";
            CreateRoomRequest request = new CreateRoomRequest(1L, "batuhan", 10, "classic");
            when(lobbyService.createRoom(anyLong(), anyString(), anyInt(), anyString())).thenReturn(mockRoomId);

            // Act
            ResultActions result = mockMvc.perform(post("/api/lobby/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(content().string(mockRoomId));
        }

        @Test
        @DisplayName("Should return 200 OK when a player joins an existing room successfully")
        void shouldJoinRoomSuccessfully() throws Exception {
            // Arrange
            JoinRoomRequest request = new JoinRoomRequest("room1234", 2L, "opponent", "classic");

            // Act
            ResultActions result = mockMvc.perform(post("/api/lobby/join")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when joining a room fails due to invalid state")
        void shouldReturnBadRequestWhenJoinFails() throws Exception {
            // Arrange
            JoinRoomRequest request = new JoinRoomRequest("full-room", 3L, "tester", "classic");
            doThrow(new IllegalStateException("Room is invalid, expired, or already in progress."))
                .when(lobbyService).joinRoom(anyString(), anyLong(), anyString());

            // Act
            ResultActions result = mockMvc.perform(post("/api/lobby/join")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Assert
            result.andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Lobby Data Retrieval")
    class DataRetrievalTests {

        @Test
        @DisplayName("Should return a list of all active game rooms with their current status")
        void shouldReturnListOfActiveRooms() throws Exception {
            // Arrange
            GameRoomResponse room = GameRoomResponse.builder()
                .roomId("room1")
                .status("WAITING")
                .theme("classic")
                .build();
            when(lobbyService.getAllActiveRooms()).thenReturn(List.of(room));

            // Act
            ResultActions result = mockMvc.perform(get("/api/lobby/rooms"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roomId").value("room1"))
                .andExpect(jsonPath("$[0].status").value("WAITING"));
        }

        @Test
        @DisplayName("Should return specific room details when a valid room ID is provided")
        void shouldReturnRoomStatusSuccessfully() throws Exception {
            // Arrange
            GameRoomResponse room = GameRoomResponse.builder()
                .roomId("test-room")
                .status("WAITING")
                .theme("classic")
                .build();
            when(lobbyService.getRoomOrThrow("test-room")).thenReturn(room);

            // Act
            ResultActions result = mockMvc.perform(get("/api/lobby/status/test-room"));

            // Assert
            result.andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value("test-room"));
        }

        @Test
        @DisplayName("Should return 404 Not Found when requesting status of a non-existent room")
        void shouldReturnNotFoundForInvalidRoom() throws Exception {
            // Arrange
            when(lobbyService.getRoomOrThrow("invalid-id"))
                .thenThrow(new ResourceNotFoundException("Room not found with ID: invalid-id"));

            // Act
            ResultActions result = mockMvc.perform(get("/api/lobby/status/invalid-id"));

            // Assert
            result.andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Room Cancellation Operations")
    class RoomCancellationTests {

        @Test
        @DisplayName("Should return 204 No Content when a room is cancelled successfully by host")
        void shouldCancelRoomSuccessfully() throws Exception {
            // Arrange
            String roomId = "room1234";

            // Act
            ResultActions result = mockMvc.perform(delete("/api/lobby/cancel/" + roomId)
                .param("userId", "1")
                .contentType(MediaType.APPLICATION_JSON));

            // Assert
            result.andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Should return 404 Not Found when cancelling a non-existent room")
        void shouldReturnNotFoundWhenCancelRoomNotFound() throws Exception {
            // Arrange
            String roomId = "room1234";
            doThrow(new ResourceNotFoundException("Room not found"))
                .when(lobbyService).cancelRoom(eq(roomId), anyLong());

            // Act
            ResultActions result = mockMvc.perform(delete("/api/lobby/cancel/" + roomId)
                .param("userId", "1")
                .contentType(MediaType.APPLICATION_JSON));

            // Assert
            result.andExpect(status().isNotFound());
        }
    }
}
