package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.GameResponse;
import com.batuhan.chess.api.dto.MoveRequest;
import com.batuhan.chess.application.service.GameService;
import com.batuhan.chess.domain.model.Game;
import com.batuhan.chess.domain.model.Position;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/move")
    public void processMove(MoveRequest request) {
        try {
            Position from = new Position(request.fromFile(), request.fromRank());
            Position to = new Position(request.toFile(), request.toRank());

            List<GameResponse.ExecutedMove> executedMoves = gameService.makeMove(
                request.gameId(), from, to, request.promotionType()
            );

            Game updatedGame = gameService.getGame(request.gameId());
            GameResponse response = new GameResponse(
                request.gameId(),
                updatedGame.getBoard().toString(),
                updatedGame.getCurrentTurn(),
                updatedGame.getStatus(),
                executedMoves,
                updatedGame.getHumanReadableHistory(),
                updatedGame.getLastMoveMessage()
            );

            messagingTemplate.convertAndSend("/topic/game/" + request.gameId(), response);

        } catch (Exception e) {
            log.error("System error during move: ", e);
        }
    }
}
