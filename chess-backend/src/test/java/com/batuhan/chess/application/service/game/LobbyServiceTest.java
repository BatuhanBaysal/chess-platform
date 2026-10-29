package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.lobby.GameRoomResponse;
import com.batuhan.chess.api.dto.lobby.MatchFoundMessage;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.domain.model.chess.Game;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Lobby Service Match-Making and Concurrency Tests")
class LobbyServiceTest {

    @Mock
    private GameService gameService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private RLock rLock;

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

        @Test
        @DisplayName("Should throw ResourceNotFoundException when getRoomOrThrow is called with unknown ID")
        void shouldThrowException_WhenGetRoomOrThrowCalledWithUnknownId() {
            // Act & Assert
            assertThatThrownBy(() -> lobbyService.getRoomOrThrow("missing-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Room not found with ID: missing-id");
        }
    }

    @Nested
    @DisplayName("Player Matching Operations")
    class MatchMakingTests {

        @Test
        @DisplayName("Should trigger game creation and notify both players when a match is found")
        void shouldStartGameAndNotifyPlayersOnSuccessfulJoin() throws Exception {
            // Arrange
            Long hostId = 1L;
            Long guestId = 2L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            Game mockGame = mock(Game.class);
            when(gameService.getGame(roomId)).thenReturn(mockGame);
            when(gameService.getActiveGameIdByUserId(guestId)).thenReturn(null);

            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);

            // Act
            lobbyService.joinRoom(roomId, guestId, "guestUser");

            // Assert
            verify(gameService).createNewGameWithPlayers(roomId, hostId, guestId);
            verify(mockGame).setPlayerNames("hostUser", "guestUser");

            ArgumentCaptor<MatchFoundMessage> messageCaptor = ArgumentCaptor.forClass(MatchFoundMessage.class);
            verify(messagingTemplate, times(2)).convertAndSend(eq("/topic/lobby/" + roomId), messageCaptor.capture());

            List<MatchFoundMessage> messages = messageCaptor.getAllValues();
            assertThat(messages).hasSize(2)
                .extracting(MatchFoundMessage::color)
                .containsExactlyInAnyOrder("WHITE", "BLACK");
        }

        @Test
        @DisplayName("Should throw IllegalStateException when joiner is already in an active game")
        void shouldThrowException_WhenJoinerAlreadyInActiveGame() throws Exception {
            // Arrange
            Long hostId = 1L;
            Long guestId = 2L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            when(gameService.getActiveGameIdByUserId(guestId)).thenReturn("existing-game-456");
            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.joinRoom(roomId, guestId, "guestUser"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("You are already in an active game session.");

            verify(gameService, never()).createNewGameWithPlayers(anyString(), any(), any());
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when a player tries to join their own room")
        void shouldFailWhenHostJoinsSelfRoom() throws Exception {
            // Arrange
            Long hostId = 1L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.joinRoom(roomId, hostId, "hostUser"))
                .isInstanceOf(IllegalArgumentException.class);

            verifyNoInteractions(gameService);
        }

        @Test
        @DisplayName("Should throw IllegalStateException when attempting to join a non-existent room")
        void shouldFailForInvalidRoomId() throws Exception {
            // Arrange
            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.joinRoom("invalid-id", 2L, "guestUser"))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Room Visibility")
    class VisibilityTests {

        @Test
        @DisplayName("Should only expose rooms with WAITING status to the active rooms list")
        void shouldFilterOnlyWaitingRooms() throws Exception {
            // Arrange
            String room1 = lobbyService.createRoom(1L, "user1", 5, "classic");
            String room2 = lobbyService.createRoom(2L, "user2", 10, "modern");

            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);

            // Act
            lobbyService.joinRoom(room1, 3L, "user3");
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
    @DisplayName("Distributed Locking & Safety")
    class ConcurrencyAndLockTests {

        @Test
        @DisplayName("Should throw GameOperationException when distributed lock acquisition fails on join")
        void shouldFailWhenLockAcquisitionFailsOnJoin() throws Exception {
            // Arrange
            String roomId = lobbyService.createRoom(1L, "hostUser", 10, "classic");

            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.joinRoom(roomId, 2L, "guestUser"))
                .isInstanceOf(GameOperationException.class)
                .hasMessageContaining("Could not acquire lock for joining room.");

            verify(gameService, never()).createNewGameWithPlayers(anyString(), any(), any());
        }

        @Test
        @DisplayName("Should cancel room and broadcast cancellation event when host initiates cancellation")
        void shouldCancelRoomAndBroadcastEventSuccessfully() throws Exception {
            // Arrange
            Long hostId = 1L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);

            // Act
            lobbyService.cancelRoom(roomId, hostId);

            // Assert
            assertThat(lobbyService.getRoom(roomId)).isEmpty();
            verify(messagingTemplate).convertAndSend(eq("/topic/lobby"), argThat((Object map) -> {
                if (map instanceof Map<?, ?> m) {
                    return "LOBBY_CANCELLED".equals(m.get("type")) && roomId.equals(m.get("roomId"));
                }
                return false;
            }));
        }

        @Test
        @DisplayName("Should throw IllegalStateException when non-host user tries to cancel room")
        void shouldFailWhenUnauthorizedUserTriesToCancelRoom() throws Exception {
            // Arrange
            Long hostId = 1L;
            Long unauthorizedUserId = 99L;
            String roomId = lobbyService.createRoom(hostId, "hostUser", 10, "classic");

            when(redissonClient.getLock(anyString())).thenReturn(rLock);
            when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> lobbyService.cancelRoom(roomId, unauthorizedUserId))
                .isInstanceOf(IllegalStateException.class);

            assertThat(lobbyService.getRoom(roomId)).isPresent();
            verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        }
    }
}
