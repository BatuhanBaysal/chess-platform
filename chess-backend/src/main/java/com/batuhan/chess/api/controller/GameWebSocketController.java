package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.game.MoveRequest;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.chess.Position;
import com.batuhan.chess.domain.model.history.GameResult;
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
            broadcastGameUpdate(request.gameId(), updatedGame, executedMoves);
            log.debug("Move broadcasted for room: {}. Status: {}", request.gameId(), updatedGame.getStatus());

        } catch (Exception e) {
            log.error("Failed to process move in room {}: {}", request.gameId(), e.getMessage());
        }
    }

    @MessageMapping("/timeout")
    public void processTimeout(MoveRequest request) {
        try {
            Game game = gameService.getGame(request.gameId());
            log.info("Processing timeout for game: {}", request.gameId());

            boolean isWhiteTurn = game.getCurrentTurn().name().equalsIgnoreCase("WHITE");
            GameResult result = isWhiteTurn ? GameResult.BLACK_WIN : GameResult.WHITE_WIN;

            gameService.finishAndPersistGame(request.gameId(), result, GameStatus.TIMEOUT);
            messagingTemplate.convertAndSend("/topic/game/" + request.gameId(), "TIMEOUT_BY_" + game.getCurrentTurn().name());

        } catch (Exception e) {
            log.error("Error handling timeout for game {}: {}", request.gameId(), e.getMessage());
        }
    }

    private void broadcastGameUpdate(String gameId, Game updatedGame, List<GameResponse.ExecutedMove> executedMoves) {
        GameResponse response = new GameResponse(
            gameId,
            updatedGame.getBoard().toString(),
            updatedGame.getCurrentTurn(),
            updatedGame.getStatus(),
            executedMoves,
            updatedGame.getHumanReadableHistory(),
            updatedGame.getLastMoveMessage(),
            updatedGame.getWhitePlayerId(),
            updatedGame.getBlackPlayerId()
        );
        messagingTemplate.convertAndSend("/topic/game/" + gameId, response);
    }
}
