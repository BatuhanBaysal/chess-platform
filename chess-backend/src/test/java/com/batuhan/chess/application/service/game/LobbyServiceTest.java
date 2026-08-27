package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.lobby.GameRoomResponse;
import com.batuhan.chess.api.dto.lobby.MatchFoundMessage;
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
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

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
            String theme = "classic";

            // Act
            String roomId = lobbyService.createRoom(userId, username, 10, theme);

            // Assert
            assertThat(roomId).isNotBlank().hasSize(8);
            assertThat(lobbyService.getAllActiveRooms()).hasSize(1);

            assertThat(lobbyService.getRoom(roomId))
                .isPresent()
                .hasValueSatisfying(r -> {
                    assertThat(r.hostId()).isEqualTo(userId);
                    assertThat(r.status()).isEqualTo("WAITING");
                    assertThat(r.theme()).isEqualTo(theme);
                });
        }

        @Test
        @DisplayName("Should remove an existing room from active registry")
        void shouldRemoveRoomSuccessfully() {
            // Arrange
            String roomId = lobbyService.createRoom(1L, "user1", 5, "classic");

            // Act
            lobbyService.removeRoom(roomId);

            // Assert
            assertThat(lobbyService.getRoom(roomId)).isEmpty();
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
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            // Act & Assert
            lobbyService.joinRoom(roomId, guestId, "guestUser");

            verify(gameService).createNewGameWithPlayers(roomId, hostId, guestId);

            ArgumentCaptor<MatchFoundMessage> messageCaptor = ArgumentCaptor.forClass(MatchFoundMessage.class);
            verify(messagingTemplate, times(2)).convertAndSend(eq("/topic/lobby/" + roomId), messageCaptor.capture());

            List<MatchFoundMessage> messages = messageCaptor.getAllValues();
            assertThat(messages).hasSize(2)
                .extracting(MatchFoundMessage::color)
                .containsExactlyInAnyOrder("WHITE", "BLACK");

            assertThat(messages)
                .extracting(MatchFoundMessage::theme)
                .containsOnly("classic");
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when a player tries to join their own game room")
        void shouldFailWhenHostJoinsSelfRoom() {
            // Arrange
            Long hostId = 1L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.joinRoom(roomId, hostId, "hostUser"))
                .isInstanceOf(IllegalArgumentException.class);

            verifyNoInteractions(gameService);
            verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        }

        @Test
        @DisplayName("Should throw IllegalStateException when attempting to join a non-existent room")
        void shouldFailForInvalidRoomId() {
            // Act & Assert
            assertThatThrownBy(() -> lobbyService.joinRoom("invalid-id", 2L, "guestUser"))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Room Filtering and Visibility")
    class VisibilityTests {

        @Test
        @DisplayName("Should only expose rooms with WAITING status to the lobby list")
        void shouldFilterOnlyWaitingRooms() {
            // Arrange
            String room1 = lobbyService.createRoom(1L, "user1", 5, "classic");
            String room2 = lobbyService.createRoom(2L, "user2", 10, "modern");
            lobbyService.joinRoom(room1, 3L, "user3");

            // Act
            Collection<GameRoomResponse> activeRooms = lobbyService.getAllActiveRooms();

            // Assert
            assertThat(activeRooms)
                .hasSize(1)
                .first()
                .extracting(GameRoomResponse::roomId)
                .isEqualTo(room2);
        }
    }

    @Nested
    @DisplayName("Room Cancellation and Ghost Game Prevention")
    class RoomCancellationTests {

        @Test
        @DisplayName("Should successfully cancel room, remove from active registry and broadcast cancellation event")
        void shouldCancelRoomAndBroadcastEventSuccessfully() {
            // Arrange
            Long hostId = 1L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            // Act & Assert
            lobbyService.cancelRoom(roomId, hostId);

            assertThat(lobbyService.getRoom(roomId)).isEmpty();
            verify(messagingTemplate).convertAndSend(eq("/topic/lobby"), argThat((Object map) -> {
                if (map instanceof Map<?, ?> m) {
                    return "LOBBY_CANCELLED".equals(m.get("type")) && roomId.equals(m.get("roomId"));
                }
                return false;
            }));
        }

        @Test
        @DisplayName("Should throw IllegalStateException to cancel room when requested by an unauthorized user")
        void shouldFailWhenUnauthorizedUserTriesToCancelRoom() {
            // Arrange
            Long hostId = 1L;
            Long unauthorizedUserId = 99L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.cancelRoom(roomId, unauthorizedUserId))
                .isInstanceOf(IllegalStateException.class);

            assertThat(lobbyService.getRoom(roomId)).isPresent();
            verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        }

        @Test
        @DisplayName("Should prevent joining a cancelled or non-waiting room (Ghost game prevention)")
        void shouldPreventJoiningCancelledOrExpiredRoom() {
            // Arrange
            Long hostId = 1L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");
            lobbyService.cancelRoom(roomId, hostId);

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.joinRoom(roomId, 2L, "guestUser"))
                .isInstanceOf(IllegalStateException.class);

            verifyNoInteractions(gameService);
        }
    }
}
