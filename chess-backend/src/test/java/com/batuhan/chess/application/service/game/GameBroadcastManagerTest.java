package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.domain.model.chess.Game;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GameBroadcastManager Unit Tests")
class GameBroadcastManagerTest {

    @Mock
    private GameWebSocketController webSocketController;

    @Mock
    private Game game;

    @InjectMocks
    private GameBroadcastManager broadcastManager;

    private static final String GAME_ID = "game-123";

    @BeforeEach
    void setUp() {
        // Setup configuration before each test execution
    }

    @Test
    @DisplayName("Should broadcast immediately on the first call")
    void shouldBroadcastImmediatelyOnFirstCall() {
        // Arrange

        // Act
        broadcastManager.throttledBroadcast(GAME_ID, game);

        // Assert
        verify(webSocketController, times(1)).broadcastGameUpdate(GAME_ID, game);
    }

    @Test
    @DisplayName("Should throttle consecutive rapid broadcast calls within threshold")
    void shouldThrottleRapidBroadcastCalls() {
        // Arrange
        broadcastManager.throttledBroadcast(GAME_ID, game);

        // Act
        broadcastManager.throttledBroadcast(GAME_ID, game);

        // Assert
        verify(webSocketController, times(1)).broadcastGameUpdate(GAME_ID, game);
    }

    @Test
    @DisplayName("Should allow broadcast again after throttle threshold elapses")
    void shouldAllowBroadcastAfterThresholdElapses() {
        // Arrange
        broadcastManager.throttledBroadcast(GAME_ID, game);
        @SuppressWarnings("unchecked")
        Map<String, Long> lastBroadcastTimes = (Map<String, Long>) ReflectionTestUtils.getField(broadcastManager, "lastBroadcastTimes");
        if (lastBroadcastTimes != null) {
            lastBroadcastTimes.put(GAME_ID, System.currentTimeMillis() - 200);
        }

        // Act
        broadcastManager.throttledBroadcast(GAME_ID, game);

        // Assert
        verify(webSocketController, times(2)).broadcastGameUpdate(GAME_ID, game);
    }

    @Test
    @DisplayName("Should remove game entry and allow immediate broadcast on next call")
    void shouldRemoveGameAndAllowImmediateBroadcast() {
        // Arrange
        broadcastManager.throttledBroadcast(GAME_ID, game);
        broadcastManager.removeGame(GAME_ID);

        // Act
        broadcastManager.throttledBroadcast(GAME_ID, game);

        // Assert
        verify(webSocketController, times(2)).broadcastGameUpdate(GAME_ID, game);
    }
}
