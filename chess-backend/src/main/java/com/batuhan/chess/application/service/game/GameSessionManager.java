package com.batuhan.chess.application.service.game;

import com.batuhan.chess.domain.model.chess.Board;
import com.batuhan.chess.domain.model.chess.Game;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class GameSessionManager {

    @Getter
    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();

    @Getter
    private final Map<String, Set<Long>> readyPlayers = new ConcurrentHashMap<>();

    @Getter
    private final Map<String, ConcurrentHashMap<Long, Long>> playerHeartbeats = new ConcurrentHashMap<>();

    @Getter
    private final Map<String, Long> lastBroadcastTimes = new ConcurrentHashMap<>();

    public void createNewGameWithPlayers(String roomId, Long whiteId, Long blackId, int timeLimit) {
        activeGames.remove(roomId);
        readyPlayers.remove(roomId);
        lastBroadcastTimes.remove(roomId);

        Game newGame = new Game(new Board());
        newGame.setWhitePlayerId(whiteId);
        newGame.setBlackPlayerId(blackId);
        newGame.startClock(timeLimit);

        activeGames.put(roomId, newGame);
    }

    public Game getGame(String gameId) {
        return activeGames.get(gameId);
    }

    public void removeGame(String gameId) {
        activeGames.remove(gameId);
        readyPlayers.remove(gameId);
        lastBroadcastTimes.remove(gameId);
        playerHeartbeats.remove(gameId);
    }

    public boolean isGameStarted(String gameId) {
        Game game = activeGames.get(gameId);
        if (game == null) return false;

        Set<Long> ready = readyPlayers.get(gameId);
        if (ready == null || ready.isEmpty()) return false;

        if (game.isAiGame()) {
            return true;
        }

        return ready.size() >= 2;
    }

    public String getActiveGameIdByUserId(Long userId) {
        return activeGames.entrySet().stream()
            .filter(entry -> {
                Game g = entry.getValue();
                return (g.getWhitePlayerId().equals(userId) || g.getBlackPlayerId().equals(userId))
                    && !g.getStatus().isFinished();
            })
            .map(Map.Entry::getKey)
            .findFirst()
            .orElse(null);
    }

    public void recordHeartbeat(String gameId, Long userId) {
        if (gameId == null || userId == null) return;
        playerHeartbeats.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>()).put(userId, System.currentTimeMillis());
    }
}
