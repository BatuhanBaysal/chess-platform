package com.batuhan.chess.application.service.game;

import org.springframework.stereotype.Service;

@Service
public class EloService {

    private static final int K_FACTOR = 32;

    public int calculateGain(int playerRating, int opponentRating, double actualScore) {
        int effectiveOpponentRating = (opponentRating <= 0) ? 1200 : opponentRating;

        double ratingDiff = (double) (effectiveOpponentRating - playerRating);
        double expectedScore = 1.0 / (1.0 + Math.pow(10, ratingDiff / 400.0));

        double gain = K_FACTOR * (actualScore - expectedScore);
        int finalGain = (int) Math.round(gain);

        if (actualScore == 1.0 && finalGain < 0) return 1;
        if (actualScore == 0.0 && finalGain > 0) return -1;

        return finalGain;
    }
}
