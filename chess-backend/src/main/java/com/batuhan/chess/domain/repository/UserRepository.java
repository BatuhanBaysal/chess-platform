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
    Optional<UserEntity> findByUsernameAndActiveTrue(String username);

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmailAndActiveTrue(String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    Page<UserEntity> findAllByActiveTrue(Pageable pageable);

    @Query("SELECT u FROM UserEntity u WHERE u.active = true AND (u.isGuest = false OR u.isGuest IS NULL) AND u.role != com.batuhan.chess.domain.model.user.UserRole.ROLE_GUEST")
    Page<UserEntity> findAllActiveMembers(Pageable pageable);

    @Query("SELECT u FROM UserEntity u WHERE u.active = true AND (u.isGuest = true OR u.role = com.batuhan.chess.domain.model.user.UserRole.ROLE_GUEST)")
    Page<UserEntity> findAllActiveGuests(Pageable pageable);

    Page<UserEntity> findAllByActiveTrueOrderByEloRatingDesc(Pageable pageable);

    @Query("SELECT u FROM UserEntity u WHERE u.active = true ORDER BY u.eloRating DESC")
    List<UserEntity> findTop3ByOrderByEloRatingDesc(Pageable pageable);
}
