package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.controller.GameWebSocketController;
import com.batuhan.chess.domain.model.chess.Game;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
            webSocketController.broadcastGameUpdate(gameId, game);
        }
    }

    public void removeGame(String gameId) {
        lastBroadcastTimes.remove(gameId);
    }
}
