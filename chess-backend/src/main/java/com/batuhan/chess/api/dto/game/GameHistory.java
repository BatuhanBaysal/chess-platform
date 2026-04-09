package com.batuhan.chess.api.dto.game;

import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.chess.GameStatus;
import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record GameHistory(
    Long id,
    Long whitePlayerId,
    String whitePlayerName,
    Long blackPlayerId,
    String blackPlayerName,
    GameResult result,
    GameStatus finishMethod,
    LocalDateTime playedAt
) {}
