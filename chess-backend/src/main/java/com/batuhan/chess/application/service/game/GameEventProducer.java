package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.config.RabbitMQConfig;
import com.batuhan.chess.api.dto.game.GameAnalysisMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendGameForAnalysis(GameAnalysisMessage message) {
        log.info("Sending game ID: {} to RabbitMQ for asynchronous analysis", message.gameId());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.GAME_EXCHANGE,
            RabbitMQConfig.GAME_ANALYSIS_ROUTING_KEY,
            message
        );
    }
}
