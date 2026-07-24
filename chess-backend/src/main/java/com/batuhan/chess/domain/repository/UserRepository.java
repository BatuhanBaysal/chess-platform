package com.batuhan.chess.domain.repository;

import com.batuhan.chess.domain.model.user.UserEntity;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    @Cacheable(value = "users", key = "#username")
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<UserEntity> findAllByOrderByEloRatingDesc();

    Page<UserEntity> findAll(Pageable pageable);

    @Query("SELECT u FROM UserEntity u ORDER BY u.eloRating DESC")
    List<UserEntity> findTop3ByOrderByEloRatingDesc(Pageable pageable);
}
