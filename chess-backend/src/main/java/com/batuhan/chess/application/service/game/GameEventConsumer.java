package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.config.RabbitMQConfig;
import com.batuhan.chess.api.dto.game.GameAnalysisMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameEventConsumer {

    private final StockfishService stockfishService;

    @RabbitListener(queues = RabbitMQConfig.GAME_ANALYSIS_QUEUE)
    public void handleGameAnalysis(GameAnalysisMessage message) {
        log.info("Received game ID: {} from RabbitMQ queue, starting background analysis...", message.gameId());

        try {
            if (message.moves() != null && !message.moves().isEmpty()) {
                int evaluation = stockfishService.getEvaluation(message.moves(), 12);
                log.info("Background Stockfish evaluation completed for game ID: {}, Final Score: {}", message.gameId(), evaluation);
            }

            log.info("Successfully completed asynchronous analysis for game ID: {}", message.gameId());
        } catch (Exception e) {
            log.error("Error occurred while processing game analysis for game ID: {}", message.gameId(), e);
        }
    }
}
