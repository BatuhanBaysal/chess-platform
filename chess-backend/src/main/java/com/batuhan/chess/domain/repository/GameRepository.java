package com.batuhan.chess.domain.repository;

import com.batuhan.chess.domain.model.history.GameEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<GameEntity, Long> {

    @EntityGraph(attributePaths = {"whitePlayer", "blackPlayer"})
    List<GameEntity> findByWhitePlayerIdOrBlackPlayerIdOrderByPlayedAtDesc(Long whiteId, Long blackId);
}
