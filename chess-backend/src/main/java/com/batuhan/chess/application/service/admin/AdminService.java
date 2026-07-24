package com.batuhan.chess.application.service.admin;

import com.batuhan.chess.api.dto.admin.AdminActiveGameResponseDTO;
import com.batuhan.chess.api.dto.admin.AdminUserResponseDTO;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final GameService gameService;

    @Transactional(readOnly = true)
    public Page<AdminUserResponseDTO> getAllUsers(Pageable pageable) {
        log.info("Admin Service: Fetching paginated system users (Page: {}, Size: {})", pageable.getPageNumber(), pageable.getPageSize());

        return userRepository.findAll(pageable)
            .map(user -> AdminUserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .eloRating(user.getEloRating())
                .totalWins(user.getTotalWins())
                .totalLosses(user.getTotalLosses())
                .totalDraws(user.getTotalDraws())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build());
    }

    @Transactional
    public void deleteUser(Long id) {
        log.warn("Admin Service: Execution of soft-delete account termination for user ID: {}", id);
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new GameOperationException("User not found with id: " + id));

        user.setActive(false);
        userRepository.save(user);

        log.info("Admin Service: Successfully deactivated (soft-deleted) user account: {}", user.getUsername());
    }

    @Transactional(readOnly = true)
    public List<AdminActiveGameResponseDTO> getActiveGames() {
        log.info("Admin Service: Inspecting in-memory active game sessions for ghost session monitoring");
        Map<String, Game> activeGamesMap = gameService.getActiveGamesMap();

        return activeGamesMap.entrySet().stream()
            .map(entry -> {
                String gameId = entry.getKey();
                Game game = entry.getValue();
                return AdminActiveGameResponseDTO.builder()
                    .gameId(gameId)
                    .whitePlayerId(game.getWhitePlayerId())
                    .blackPlayerId(game.getBlackPlayerId())
                    .status(game.getStatus())
                    .whiteRemainingTimeMs(game.getWhiteRemainingTimeMs())
                    .blackRemainingTimeMs(game.getBlackRemainingTimeMs())
                    .build();
            })
            .toList();
    }

    @Transactional
    public void forceFinishGame(String gameId) {
        log.warn("Admin Service: Forcing emergency termination routine for game session: {}", gameId);

        Game game = gameService.getGame(gameId);
        if (game == null) {
            throw new GameOperationException("Active game session not found with id: " + gameId);
        }

        gameService.processGameFinish(gameId, GameResult.DRAW, GameStatus.ABANDONED);
        log.info("Admin Service: Successfully forced finish/abandonment for game session: {}", gameId);
    }
}
