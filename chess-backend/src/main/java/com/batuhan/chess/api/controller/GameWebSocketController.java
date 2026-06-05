package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.MoveRequest;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameResult;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@Slf4j
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(@Lazy GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

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
            broadcastGameUpdate(request.getGameId(), game);
        }
    }

    @MessageMapping("/move")
    public void processMove(MoveRequest request) {
        Position from = new Position(request.fromFile(), request.fromRank());
        Position to = new Position(request.toFile(), request.toRank());
        gameService.makeMove(request.gameId(), from, to, request.promotionType());
        Game updatedGame = gameService.getGame(request.gameId());
        broadcastGameUpdate(request.gameId(), updatedGame);
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public Map<String, String> handleException(Exception exception) {
        log.error("WebSocket Error: ", exception);
        return Map.of("error", exception.getMessage() != null ? exception.getMessage() : "An error occurred");
    }

    public void broadcastGameUpdate(String gameId, Game updatedGame) {
        if (updatedGame == null) return;
        updatedGame.updateTime();

        log.info("Broadcasting Update {}: WhiteTime={}ms, BlackTime={}ms",
            gameId,
            updatedGame.getWhiteRemainingTimeMs(),
            updatedGame.getBlackRemainingTimeMs());

        GameResponse response = gameService.convertToResponse(gameId, updatedGame);
        messagingTemplate.convertAndSend("/topic/game/" + gameId, response);
    }

    public void sendGameOver(String gameId, GameResult result) {
        log.info("Broadcasting Game Over for {}: Result={}", gameId, result);
        messagingTemplate.convertAndSend("/topic/game/" + gameId, Map.of(
            "type", "GAME_OVER",
            "result", result.toString()
        ));
    }
}
