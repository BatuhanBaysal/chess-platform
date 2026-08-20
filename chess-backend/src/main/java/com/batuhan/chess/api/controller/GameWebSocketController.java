package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.DismissRequest;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.HeartbeatRequest;
import com.batuhan.chess.api.dto.game.MoveRequest;
import com.batuhan.chess.api.dto.game.ReadyRequest;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
@Controller
@Tag(name = "Game WebSocket", description = "Real-time STOMP messaging endpoints for live chess matches, moves, and synchronization.")
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(@Lazy GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @Operation(
        summary = "Player ready signal",
        description = "Handles player ready state initialization for starting the game session."
    )
    @ApiResponse(responseCode = "200", description = "Ready state processed successfully")
    @MessageMapping("/ready")
    public void processReady(@Payload ReadyRequest request) {
        log.info("WS_ACTION: Ready request received for gameId: {} by userId: {}", request.gameId(), request.userId());
        boolean bothReady = gameService.setPlayerReady(request.gameId(), request.userId());
        if (bothReady) {
            Game game = gameService.getGame(request.gameId());
            broadcastGameUpdate(request.gameId(), game);
        }
    }

    @Operation(
        summary = "Process chess move",
        description = "Receives a move payload, executes rules, updates state, and broadcasts to room."
    )
    @ApiResponse(responseCode = "200", description = "Move executed successfully")
    @MessageMapping("/move")
    public void processMove(@Payload MoveRequest request) {
        log.info("WS_ACTION: Move received for gameId: {}", request.gameId());
        Position from = new Position(request.fromFile(), request.fromRank());
        Position to = new Position(request.toFile(), request.toRank());
        gameService.makeMove(request.gameId(), from, to, request.promotionType());
        Game updatedGame = gameService.getGame(request.gameId());
        broadcastGameUpdate(request.gameId(), updatedGame);
    }

    @Operation(
        summary = "Handle connection heartbeat",
        description = "Records client heartbeat to track active connection status."
    )
    @ApiResponse(responseCode = "200", description = "Heartbeat recorded successfully")
    @MessageMapping("/game/heartbeat")
    public void handleHeartbeat(@Payload HeartbeatRequest request) {
        gameService.recordHeartbeat(request.gameId(), request.userId());
    }

    @Operation(
        summary = "Handle game dismissal",
        description = "Processes player disconnect or dismiss signal to terminate session."
    )
    @ApiResponse(responseCode = "200", description = "Game dismissed successfully")
    @MessageMapping("/game/dismiss")
    public void handleDismiss(@Payload DismissRequest request) {
        log.info("WS_ACTION: Received dismiss signal for gameId: {} by userId: {}", request.gameId(), request.userId());
        gameService.processPlayerDismiss(request.gameId(), request.userId());
        messagingTemplate.convertAndSendToUser(
            String.valueOf(request.userId()),
            "/queue/errors",
            Map.of("type", "DISMISSED", "message", "Game dismissed and terminated.")
        );
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public Map<String, String> handleException(Exception exception) {
        log.error("WS_ERROR: WebSocket message handling error: ", exception);
        return Map.of("error", exception.getMessage() != null ? exception.getMessage() : "An error occurred");
    }

    public void broadcastGameUpdate(String gameId, Game updatedGame) {
        if (updatedGame == null) return;
        updatedGame.updateTime();

        log.info("WS_BROADCAST: Update {}: WhiteTime={}ms, BlackTime={}ms, Status={}",
            gameId,
            updatedGame.getWhiteRemainingTimeMs(),
            updatedGame.getBlackRemainingTimeMs(),
            updatedGame.getStatus());

        GameResponse response = gameService.convertToResponse(gameId, updatedGame);
        messagingTemplate.convertAndSend("/topic/game/" + gameId, response);
    }

    public void sendGameOver(String gameId, GameResult result) {
        log.info("WS_BROADCAST: Game Over for {}: Result={}", gameId, result);
        messagingTemplate.convertAndSend("/topic/game/" + gameId, Map.of(
            "type", "GAME_OVER",
            "result", result.name()
        ));
    }
}
