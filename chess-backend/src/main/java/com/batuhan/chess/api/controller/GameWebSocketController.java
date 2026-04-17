package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.MoveRequest;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameResult;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @Data
    public static class ReadyRequest {
        private String gameId;
        private Long userId;
    }

    @MessageMapping("/ready")
    public void processReady(ReadyRequest request) {
        boolean bothReady = gameService.setPlayerReady(request.getGameId(), request.getUserId());
        if (bothReady) {
            Game game = gameService.getGame(request.getGameId());
            broadcastGameUpdate(request.getGameId(), game, List.of());
        }
    }

    @MessageMapping("/move")
    public void processMove(MoveRequest request) {
        Position from = new Position(request.fromFile(), request.fromRank());
        Position to = new Position(request.toFile(), request.toRank());

        List<GameResponse.ExecutedMove> executedMoves = gameService.makeMove(
            request.gameId(), from, to, request.promotionType()
        );

        Game updatedGame = gameService.getGame(request.gameId());
        broadcastGameUpdate(request.gameId(), updatedGame, executedMoves);
    }

    @MessageMapping("/timeout")
    public void processTimeout(MoveRequest request) {
        Game game = gameService.getGame(request.gameId());
        if (game == null || game.getStatus().isFinished()) return;

        GameResult result = (game.getCurrentTurn() == Color.WHITE) ? GameResult.BLACK_WIN : GameResult.WHITE_WIN;
        gameService.processGameFinish(request.gameId(), result, GameStatus.TIMEOUT);

        broadcastGameUpdate(request.gameId(), game, List.of());
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public Map<String, String> handleException(Exception exception) {
        log.error("WebSocket Error: ", exception);
        return Map.of("error", exception.getMessage() != null ? exception.getMessage() : "An error occurred");
    }

    private void broadcastGameUpdate(String gameId, Game updatedGame, List<GameResponse.ExecutedMove> executedMoves) {
        if (updatedGame == null) return;

        log.info("Broadcasting Update for {}: Status={}", gameId, updatedGame.getStatus());

        boolean isStarted = gameService.isGameStarted(gameId);
        GameResponse response = new GameResponse(
            gameId,
            updatedGame.getBoard().toString(),
            updatedGame.getCurrentTurn(),
            updatedGame.getStatus(),
            executedMoves,
            updatedGame.getHumanReadableHistory(),
            updatedGame.getLastMoveMessage(),
            updatedGame.getWhitePlayerId(),
            updatedGame.getBlackPlayerId(),
            isStarted
        );

        messagingTemplate.convertAndSend("/topic/game/" + gameId, response);
    }
}
