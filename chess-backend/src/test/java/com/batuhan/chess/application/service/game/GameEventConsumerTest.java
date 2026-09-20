package com.batuhan.chess.application.service.game;

import com.batuhan.chess.api.dto.game.GameAnalysisMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GameEventConsumerTest {

    @Mock
    private StockfishService stockfishService;

    @InjectMocks
    private GameEventConsumer gameEventConsumer;

    @Test
    void handleGameAnalysis_ShouldProcessMessageAndEvaluateStockfish() {
        // Arrange
        GameAnalysisMessage message = new GameAnalysisMessage(
            "game-123",
            "1. e4 e5",
            List.of("e4", "e5"),
            1L,
            2L
        );

        // Act
        gameEventConsumer.handleGameAnalysis(message);

        // Assert
        verify(stockfishService).getEvaluation(message.moves(), 12);
    }
}
