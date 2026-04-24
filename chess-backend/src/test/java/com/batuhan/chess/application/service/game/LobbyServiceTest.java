package com.batuhan.chess.application.service.game;

import com.batuhan.chess.application.service.game.LobbyService.GameRoom;
import com.batuhan.chess.application.service.game.LobbyService.MatchFoundMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Technical test suite for LobbyService.
 * Validates the room lifecycle, player match-making logic, and STOMP message
 * broadcasting for real-time game initialization.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Lobby Service Match-Making Tests")
class LobbyServiceTest {

    @Mock
    private GameService gameService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private LobbyService lobbyService;

    @Nested
    @DisplayName("Room Lifecycle Management")
    class RoomLifecycleTests {

        @Test
        @DisplayName("Should successfully create a room and generate an 8-character ID")
        void shouldCreateRoomAndVerifyIntegrity() {
            // Arrange
            Long userId = 1L;
            String username = "batuhan";

            // Act
            String roomId = lobbyService.createRoom(userId, username, 10);

            // Assert
            assertThat(roomId).isNotBlank().hasSize(8);
            assertThat(lobbyService.getAllActiveRooms()).hasSize(1);

            GameRoom room = lobbyService.getRoom(roomId);
            assertThat(room).isNotNull()
                .satisfies(r -> {
                    assertThat(r.getHostId()).isEqualTo(userId);
                    assertThat(r.getStatus()).isEqualTo("WAITING");
                });
        }

        @Test
        @DisplayName("Should remove an existing room from active registry")
        void shouldRemoveRoomSuccessfully() {
            // Arrange
            String roomId = lobbyService.createRoom(1L, "user1", 5);

            // Act
            lobbyService.removeRoom(roomId);

            // Assert
            assertThat(lobbyService.getRoom(roomId)).isNull();
        }
    }

    @Nested
    @DisplayName("Player Matching Operations")
    class MatchMakingTests {

        @Test
        @DisplayName("Should trigger game creation and notify both players when a match is found")
        void shouldStartGameAndNotifyPlayersOnSuccessfulJoin() {
            // Arrange
            Long hostId = 1L;
            Long guestId = 2L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10);

            // Act
            boolean result = lobbyService.joinRoom(roomId, guestId, "guestUser");

            // Assert
            assertThat(result).isTrue();
            verify(gameService).createNewGameWithPlayers(roomId, hostId, guestId);

            ArgumentCaptor<MatchFoundMessage> messageCaptor = ArgumentCaptor.forClass(MatchFoundMessage.class);
            verify(messagingTemplate, times(2)).convertAndSend(eq("/topic/lobby/" + roomId), messageCaptor.capture());

            List<MatchFoundMessage> messages = messageCaptor.getAllValues();
            assertThat(messages).hasSize(2)
                .extracting(MatchFoundMessage::getColor)
                .containsExactlyInAnyOrder("WHITE", "BLACK");
        }

        @Test
        @DisplayName("Should prevent a player from joining their own game room")
        void shouldFailWhenHostJoinsSelfRoom() {
            // Arrange
            Long hostId = 1L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10);

            // Act
            boolean result = lobbyService.joinRoom(roomId, hostId, "hostUser");

            // Assert
            assertThat(result).isFalse();
            verifyNoInteractions(gameService);
            verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        }

        @Test
        @DisplayName("Should return false when attempting to join a non-existent room")
        void shouldFailForInvalidRoomId() {
            // Act
            boolean result = lobbyService.joinRoom("invalid-id", 2L, "guestUser");

            // Assert
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Room Filtering and Visibility")
    class VisibilityTests {

        @Test
        @DisplayName("Should only expose rooms with WAITING status to the lobby list")
        void shouldFilterOnlyWaitingRooms() {
            // Arrange
            String room1 = lobbyService.createRoom(1L, "user1", 5);
            String room2 = lobbyService.createRoom(2L, "user2", 10);
            lobbyService.joinRoom(room1, 3L, "user3");

            // Act
            Collection<GameRoom> activeRooms = lobbyService.getAllActiveRooms();

            // Assert
            assertThat(activeRooms)
                .hasSize(1)
                .first()
                .extracting(GameRoom::getRoomId)
                .isEqualTo(room2);
        }
    }
}
