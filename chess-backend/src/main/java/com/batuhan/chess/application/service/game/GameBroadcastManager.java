package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.domain.model.chess.Game;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameBroadcastManager {

    private final GameWebSocketController webSocketController;
    private final Map<String, Long> lastBroadcastTimes = new ConcurrentHashMap<>();
    private static final long BROADCAST_THROTTLE_MS = 150;

    public void throttledBroadcast(String gameId, Game game) {
        long now = System.currentTimeMillis();
        Long lastTime = lastBroadcastTimes.get(gameId);

        if (lastTime == null || (now - lastTime) >= BROADCAST_THROTTLE_MS) {
            lastBroadcastTimes.put(gameId, now);
            try {
                webSocketController.broadcastGameUpdate(gameId, game);
            } catch (Exception e) {
                log.error("Broadcast failed for game {}: {}", gameId, e.getMessage(), e);
            }
        }
    }

    public void removeGame(String gameId) {
        lastBroadcastTimes.remove(gameId);
    }
}
