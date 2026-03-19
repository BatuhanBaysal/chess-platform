package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.GameResponse;
import com.batuhan.chess.api.dto.MoveRequest;
import com.batuhan.chess.application.service.GameService;
import com.batuhan.chess.domain.model.Game;
import com.batuhan.chess.domain.model.Position;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/move")
    public void processMove(MoveRequest request) {
        Position from = new Position(request.fromFile(), request.fromRank());
        Position to = new Position(request.toFile(), request.toRank());

        Game updatedGame = gameService.makeMove(request.gameId(), from, to);

        GameResponse response = new GameResponse(
            request.gameId(),
            updatedGame.getBoard().toString(),
            updatedGame.getCurrentTurn(),
            updatedGame.getStatus()
        );

        messagingTemplate.convertAndSend("/topic/game/" + request.gameId(), response);
    }
}
