package com.batuhan.chess.api.dto.game;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

public record GameAnalysisMessage(
    String gameId,
    String pgn,
    List<String> moves,
    Long whitePlayerId,
    Long blackPlayerId
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
