package com.batuhan.chess.domain.model.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    @Builder.Default
    private UUID externalId = UUID.randomUUID();

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Builder.Default
    private Integer eloRating = 1200;

    @Builder.Default
    private int totalWins = 0;

    @Builder.Default
    private int totalLosses = 0;

    @Builder.Default
    private int totalDraws = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private boolean isGuest;

    private LocalDateTime createdAt;

    public int getTotalGames() {
        return totalWins + totalLosses + totalDraws;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
