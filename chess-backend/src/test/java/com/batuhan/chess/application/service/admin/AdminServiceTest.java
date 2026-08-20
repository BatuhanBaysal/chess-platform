package com.batuhan.chess.application.service.admin;

import com.batuhan.chess.api.dto.admin.AdminActiveGameResponseDTO;
import com.batuhan.chess.api.dto.admin.AdminUserResponseDTO;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.Game;
import com.batuhan.chess.domain.model.chess.GameStatus;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Admin Service Business Logic Tests")
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameService gameService;

    @InjectMocks
    private AdminService adminService;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        testUser = UserEntity.builder()
            .id(1L)
            .username("admin_test")
            .email("admin@test.com")
            .password("encoded_pass")
            .role(UserRole.ROLE_ADMIN)
            .eloRating(1500)
            .active(true)
            .build();
    }

    @Nested
    @DisplayName("Get All Users Tests")
    class GetAllUsersTests {

        @Test
        @DisplayName("Should return paginated users successfully")
        void getAllUsers_ValidRequest_ReturnsPageOfUsers() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<UserEntity> userPage = new PageImpl<>(List.of(testUser), pageable, 1);
            when(userRepository.findAll(pageable)).thenReturn(userPage);

            // Act
            Page<AdminUserResponseDTO> result = adminService.getAllUsers(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).username()).isEqualTo("admin_test");
            verify(userRepository, times(1)).findAll(pageable);
        }
    }

    @Nested
    @DisplayName("Delete User (Soft Delete) Tests")
    class DeleteUserTests {

        @Test
        @DisplayName("Should soft delete user when user exists")
        void deleteUser_ValidId_DeactivatesUser() {
            // Arrange
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

            // Act
            adminService.deleteUser(userId);

            // Assert
            assertThat(testUser.isActive()).isFalse();
            verify(userRepository, times(1)).findById(userId);
            verify(userRepository, times(1)).save(testUser);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user to delete does not exist")
        void deleteUser_UserNotFound_ThrowsException() {
            // Arrange
            Long userId = 99L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> adminService.deleteUser(userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found with id: " + userId);

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Get Active Games Tests")
    class GetActiveGamesTests {

        @Test
        @DisplayName("Should return list of active games successfully")
        void getActiveGames_ValidState_ReturnsActiveGamesList() {
            // Arrange
            Game mockGame = mock(Game.class);
            when(mockGame.getWhitePlayerId()).thenReturn(1L);
            when(mockGame.getBlackPlayerId()).thenReturn(2L);
            when(mockGame.getStatus()).thenReturn(GameStatus.ACTIVE);
            when(mockGame.getWhiteRemainingTimeMs()).thenReturn(300000L);
            when(mockGame.getBlackRemainingTimeMs()).thenReturn(300000L);

            Map<String, Game> activeGamesMap = Map.of("game-123", mockGame);
            when(gameService.getActiveGamesMap()).thenReturn(activeGamesMap);

            // Act
            List<AdminActiveGameResponseDTO> result = adminService.getActiveGames();

            // Assert
            assertThat(result).isNotNull()
                .hasSize(1)
                .satisfies(list -> {
                    assertThat(list.get(0).gameId()).isEqualTo("game-123");
                    assertThat(list.get(0).status()).isEqualTo(GameStatus.ACTIVE);
                });
            verify(gameService, times(1)).getActiveGamesMap();
        }
    }

    @Nested
    @DisplayName("Force Finish Game Tests")
    class ForceFinishGameTests {

        @Test
        @DisplayName("Should force finish game when game exists")
        void forceFinishGame_ValidGameId_FinishesGame() {
            // Arrange
            String gameId = "game-123";
            Game mockGame = mock(Game.class);
            when(gameService.getGame(gameId)).thenReturn(mockGame);

            // Act
            adminService.forceFinishGame(gameId);

            // Assert
            verify(gameService, times(1)).getGame(gameId);
            verify(gameService, times(1)).processGameFinish(gameId, GameResult.DRAW, GameStatus.ABANDONED);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when game does not exist")
        void forceFinishGame_GameNotFound_ThrowsException() {
            // Arrange
            String gameId = "non-existent";
            when(gameService.getGame(gameId)).thenReturn(null);

            // Act & Assert
            assertThatThrownBy(() -> adminService.forceFinishGame(gameId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Active game session not found with id: " + gameId);

            verify(gameService, never()).processGameFinish(any(), any(), any());
        }
    }

    @Nested
    @DisplayName("Trigger Sandbox Game Tests")
    class TriggerSandboxGameTests {

        @Test
        @DisplayName("Should call game service to create sandbox game successfully")
        void triggerSandboxGame_ValidIds_CallsGameService() {
            // Arrange
            Long whiteId = 1L;
            Long blackId = 2L;

            // Act
            adminService.triggerSandboxGame(whiteId, blackId);

            // Assert
            verify(gameService, times(1)).createGame(whiteId, blackId);
        }
    }
}
