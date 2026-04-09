package com.batuhan.chess.domain.model.history;

import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "white_player_id", nullable = true)
    private UserEntity whitePlayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "black_player_id", nullable = true)
    private UserEntity blackPlayer;

    @Column(columnDefinition = "TEXT")
    private String pgnData;

    @Enumerated(EnumType.STRING)
    private GameResult result;

    @Enumerated(EnumType.STRING)
    private GameStatus finishMethod;

    private int whiteEloBefore;
    private int blackEloBefore;
    private Integer whiteEloGain;
    private Integer blackEloGain;

    private LocalDateTime playedAt;

    @PrePersist
    protected void onCreate() {
        this.playedAt = LocalDateTime.now();
    }
}
