package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.config.RabbitMQConfig;
import com.batuhan.chess.api.dto.game.GameAnalysisMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import java.util.List;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GameEventProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private GameEventProducer gameEventProducer;

    @Test
    void sendGameForAnalysis_ShouldPublishMessageToRabbitMQ() {
        // Arrange
        GameAnalysisMessage message = new GameAnalysisMessage(
            "game-123",
            "1. e4 e5",
            List.of("e4", "e5"),
            1L,
            2L
        );

        // Act
        gameEventProducer.sendGameForAnalysis(message);

        // Assert
        verify(rabbitTemplate).convertAndSend(
            RabbitMQConfig.GAME_EXCHANGE,
            RabbitMQConfig.GAME_ANALYSIS_ROUTING_KEY,
            message
        );
    }
}
