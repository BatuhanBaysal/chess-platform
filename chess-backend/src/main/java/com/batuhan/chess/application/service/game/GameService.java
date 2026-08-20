package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameHistory;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.HintResponse;
import com.batuhan.chess.api.dto.lobby.GameRoomResponse;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameSessionManager sessionManager;
    private final GameTimerService timerService;
    private final GameEngineService engineService;
    private final GamePersistenceService persistenceService;
    private final LobbyService lobbyService;
    private final StockfishService stockfishService;
    private final GameBroadcastManager broadcastManager;

    private static final int DEFAULT_TIME_LIMIT = 10;

    public String createGame(Long whiteId, Long blackId) {
        String gameId = UUID.randomUUID().toString().substring(0, 8);
        createNewGameWithPlayers(gameId, whiteId, blackId);
        return gameId;
    }

    public String createAiGame(Long humanUserId, boolean playAsWhite, int difficulty, Integer timeLimit) {
        String gameId = UUID.randomUUID().toString().substring(0, 8);

        Long whiteId = playAsWhite ? humanUserId : -1L;
        Long blackId = playAsWhite ? -1L : humanUserId;

        createNewGameWithPlayers(gameId, whiteId, blackId, timeLimit != null ? timeLimit : DEFAULT_TIME_LIMIT);

        if (!playAsWhite) {
            Game game = sessionManager.getGame(gameId);
            if (game != null) {
                engineService.triggerAiMoveIfNeededWithDifficulty(gameId, game, difficulty);
            }
        }

        return gameId;
    }

    public void createNewGameWithPlayers(String roomId, Long whiteId, Long blackId) {
        int timeLimit = lobbyService.getRoom(roomId)
            .map(GameRoomResponse::timeLimit)
            .orElse(DEFAULT_TIME_LIMIT);

        createNewGameWithPlayers(roomId, whiteId, blackId, timeLimit);
    }

    public void createNewGameWithPlayers(String roomId, Long whiteId, Long blackId, int timeLimit) {
        timerService.cancelTimeoutTask(roomId);
        broadcastManager.removeGame(roomId);
        sessionManager.createNewGameWithPlayers(roomId, whiteId, blackId, timeLimit);
    }

    public boolean setPlayerReady(String gameId, Long userId) {
        if (gameId == null || userId == null) return false;

        sessionManager.getReadyPlayers().computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(userId);
        Game game = sessionManager.getGame(gameId);
        if (game == null) return false;

        sessionManager.recordHeartbeat(gameId, userId);
        Set<Long> playersInRoom = sessionManager.getReadyPlayers().get(gameId);

        boolean bothReady;
        if (game.isAiGame()) {
            bothReady = playersInRoom != null && playersInRoom.contains(userId);
        } else {
            bothReady = playersInRoom != null &&
                playersInRoom.contains(game.getWhitePlayerId()) &&
                playersInRoom.contains(game.getBlackPlayerId());
        }

        if (bothReady && game.getLastMoveTimestamp() == null) {
            int timeLimit = lobbyService.getRoom(gameId)
                .map(GameRoomResponse::timeLimit)
                .orElse(DEFAULT_TIME_LIMIT);

            game.startClock(timeLimit);
            timerService.scheduleTimeoutTask(gameId, timeLimit * 60 * 1000L);

            if (game.isAiGame() && Long.valueOf(-1L).equals(game.getBlackPlayerId()) && game.getCurrentTurn() == Color.BLACK) {
                engineService.triggerAiMoveIfNeeded(gameId, game);
            }
        }

        broadcastManager.throttledBroadcast(gameId, game);
        return bothReady;
    }

    public List<GameResponse.ExecutedMove> makeMove(String gameId, Position from, Position to, String promotionType) {
        return engineService.makeMove(gameId, from, to, promotionType);
    }

    public HintResponse getEngineHint(String gameId, int depth) {
        return engineService.getEngineHint(gameId, depth);
    }

    public void processGameFinish(String gameId, GameResult result, GameStatus finishMethod) {
        persistenceService.processGameFinish(gameId, result, finishMethod);
    }

    public boolean finishGameIfActive(String gameId) {
        Game game = sessionManager.getGame(gameId);
        if (game == null) {
            return false;
        }

        if (!game.getStatus().isFinished()) {
            persistenceService.processGameFinish(
                gameId,
                timerService.determineResult(game, game.getStatus()),
                game.getStatus()
            );
            log.info("GAME_ACTION: Game successfully finished and saved to database: {}", gameId);
        }
        return true;
    }

    @Transactional
    public void handleFinishLogic(String gameId, Game game, GameResult result, GameStatus finishMethod) {
        persistenceService.handleFinishLogic(gameId, game, result, finishMethod);
    }

    public void processPlayerDismiss(String gameId, Long userId) {
        persistenceService.processPlayerDismiss(gameId, userId);
    }

    public void cleanupSession(String gameId) {
        persistenceService.cleanupSession(gameId);
    }

    public String getActiveGameIdByUserId(Long userId) {
        return sessionManager.getActiveGameIdByUserId(userId);
    }

    public Game getGame(String gameId) {
        return sessionManager.getGame(gameId);
    }

    public Map<String, Game> getActiveGamesMap() {
        return sessionManager.getActiveGames();
    }

    public boolean isGameStarted(String gameId) {
        return sessionManager.isGameStarted(gameId);
    }

    public void recordHeartbeat(String gameId, Long userId) {
        sessionManager.recordHeartbeat(gameId, userId);
    }

    @Transactional(readOnly = true)
    public List<GameEntity> getGameHistory(Long userId) {
        return persistenceService.getGameHistory(userId);
    }

    @Transactional(readOnly = true)
    public List<GameHistory> getPlayerGameHistoryDtos(Long userId) {
        List<GameEntity> games = persistenceService.getGameHistory(userId);

        return games.stream().map(game -> GameHistory.builder()
            .id(game.getId())
            .whitePlayerId(game.getWhitePlayer() != null ? game.getWhitePlayer().getId() : null)
            .whitePlayerName(game.getWhitePlayer() != null ? game.getWhitePlayer().getUsername() : "Guest")
            .blackPlayerId(game.getBlackPlayer() != null ? game.getBlackPlayer().getId() : null)
            .blackPlayerName(game.getBlackPlayer() != null ? game.getBlackPlayer().getUsername() : "Guest")
            .result(game.getResult())
            .finishMethod(game.getFinishMethod())
            .playedAt(game.getPlayedAt())
            .build()
        ).toList();
    }

    public GameResponse convertToResponse(String gameId, Game game) {
        int timeLimit = lobbyService.getRoom(gameId)
            .map(GameRoomResponse::timeLimit)
            .orElse(DEFAULT_TIME_LIMIT);

        List<GameResponse.ExecutedMove> lastMovesList = new ArrayList<>();
        List<String> history = game.getMoveHistory();

        if (history != null && !history.isEmpty()) {
            String lastMoveUci = history.get(history.size() - 1);

            if (lastMoveUci != null && lastMoveUci.length() >= 4) {
                int fromCol = lastMoveUci.charAt(0) - 'a';
                int fromRow = Character.getNumericValue(lastMoveUci.charAt(1)) - 1;
                int toCol = lastMoveUci.charAt(2) - 'a';
                int toRow = Character.getNumericValue(lastMoveUci.charAt(3)) - 1;
                int currentEval = stockfishService.getEvaluation(history, 10);

                int previousEval = 0;
                if (history.size() > 1) {
                    List<String> previousHistory = history.subList(0, history.size() - 1);
                    previousEval = stockfishService.getEvaluation(previousHistory, 10);
                }

                Color playerWhoMoved = game.getCurrentTurn().opposite();
                String quality = classifyMove(previousEval, currentEval, playerWhoMoved);

                lastMovesList.add(new GameResponse.ExecutedMove(
                    fromCol, fromRow, toCol, toRow, "UNKNOWN", currentEval, quality
                ));
            }
        }

        return new GameResponse(
            gameId,
            game.getBoard().toString(),
            game.getCurrentTurn(),
            game.getStatus(),
            lastMovesList,
            game.getHumanReadableHistory(),
            game.getLastMoveMessage(),
            game.getWhitePlayerId(),
            game.getBlackPlayerId(),
            isGameStarted(gameId),
            game.getWhiteRemainingTimeMs(),
            game.getBlackRemainingTimeMs(),
            timeLimit
        );
    }

    private String classifyMove(int previousEval, int currentEval, Color turn) {
        int diff = (turn == Color.WHITE) ? (previousEval - currentEval) : (currentEval - previousEval);

        if (diff > 300) return "BLUNDER";
        if (diff > 150) return "MISTAKE";
        if (diff > 75) return "INACCURACY";
        return "GOOD";
    }
}
