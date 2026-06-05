package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.application.service.auth.JwtService;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.domain.model.chess.*;
import com.batuhan.chess.domain.model.history.GameEntity;
import com.batuhan.chess.domain.model.history.GameResult;
import com.batuhan.chess.domain.model.user.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Game REST Controller Web Layer Tests")
class GameRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GameService gameService;

    @MockitoBean
    private JwtService jwtService;

    @Nested
    @DisplayName("Game Lifecycle Operations")
    class GameLifecycleTests {

        @Test
        @DisplayName("Should return current game state including players and start status")
        void shouldReturnCurrentGameStateSuccessfully() throws Exception {
            // Arrange
            String gameId = "test-123";
            Game game = new Game(new Board());
            GameResponse response = new GameResponse(
                gameId, "rnbqkbnr", Color.WHITE, GameStatus.ACTIVE,
                List.of(), List.of(), "", 1L, 2L, true, 300000L, 300000L, 300
            );
            when(gameService.getGame(gameId)).thenReturn(game);
            when(gameService.convertToResponse(gameId, game)).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/api/games/{gameId}", gameId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(gameId))
                .andExpect(jsonPath("$.whiteId").value(1))
                .andExpect(jsonPath("$.blackId").value(2))
                .andExpect(jsonPath("$.isStarted").value(true));
        }

        @Test
        @DisplayName("Should create a new game instance and return its initial state")
        void shouldCreateNewGameSuccessfully() throws Exception {
            // Arrange
            String gameId = "new-game";
            Game game = new Game(new Board());
            GameResponse response = new GameResponse(
                gameId, "rnbqkbnr", Color.WHITE, GameStatus.ACTIVE,
                List.of(), List.of(), "", 1L, 2L, false, 300000L, 300000L, 300
            );
            when(gameService.createGame(1L, 2L)).thenReturn(gameId);
            when(gameService.getGame(gameId)).thenReturn(game);
            when(gameService.convertToResponse(gameId, game)).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/games")
                    .param("whiteId", "1")
                    .param("blackId", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(gameId))
                .andExpect(jsonPath("$.whiteId").value(1))
                .andExpect(jsonPath("$.blackId").value(2));
        }

        @Test
        @DisplayName("Should handle game creation with null player IDs for guest matches")
        void shouldHandleGuestGameCreation() throws Exception {
            // Arrange
            String gameId = "guest-game";
            Game game = new Game(new Board());
            GameResponse response = new GameResponse(
                gameId, "rnbqkbnr", Color.WHITE, GameStatus.ACTIVE,
                List.of(), List.of(), "", null, null, false, 300000L, 300000L, 300
            );
            when(gameService.createGame(null, null)).thenReturn(gameId);
            when(gameService.getGame(gameId)).thenReturn(game);
            when(gameService.convertToResponse(gameId, game)).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/games"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(gameId))
                .andExpect(jsonPath("$.isStarted").value(false));
        }
    }

    @Nested
    @DisplayName("Move Validation and Legal Moves")
    class LegalMoveTests {

        @Test
        @DisplayName("Should return a list of valid moves when requested for a specific square")
        void shouldReturnLegalMovesForStartedGame() throws Exception {
            // Arrange
            String gameId = "started-game";
            List<Position> expectedMoves = List.of(new Position(4, 2), new Position(4, 3));
            Game mockedGame = mock(Game.class);
            when(gameService.isGameStarted(gameId)).thenReturn(true);
            when(gameService.getGame(gameId)).thenReturn(mockedGame);
            when(mockedGame.getLegalMovesForSquare(any(Position.class))).thenReturn(expectedMoves);

            // Act & Assert
            mockMvc.perform(get("/api/games/{gameId}/legal-moves", gameId)
                    .param("file", "4")
                    .param("rank", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].file").value(4))
                .andExpect(jsonPath("$[0].rank").value(2));
        }

        @Test
        @DisplayName("Should return an empty list if legal moves are requested for a non-started game")
        void shouldReturnEmptyListIfGameNotStarted() throws Exception {
            // Arrange
            String gameId = "not-started";
            when(gameService.getGame(gameId)).thenReturn(new Game(new Board()));
            when(gameService.isGameStarted(gameId)).thenReturn(false);

            // Act & Assert
            mockMvc.perform(get("/api/games/{gameId}/legal-moves", gameId)
                    .param("file", "4")
                    .param("rank", "4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
        }
    }

    @Nested
    @DisplayName("Match History Operations")
    class HistoryTests {

        @Test
        @DisplayName("Should return formatted match history for a specific user")
        void shouldReturnPlayerMatchHistory() throws Exception {
            // Arrange
            Long userId = 1L;
            UserEntity white = UserEntity.builder().id(1L).username("batuhan").build();
            UserEntity black = UserEntity.builder().id(2L).username("opponent").build();
            GameEntity history = GameEntity.builder()
                .id(100L)
                .whitePlayer(white)
                .blackPlayer(black)
                .result(GameResult.WHITE_WIN)
                .build();
            when(gameService.getGameHistory(userId)).thenReturn(List.of(history));

            // Act & Assert
            mockMvc.perform(get("/api/games/history/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].whitePlayerName").value("batuhan"))
                .andExpect(jsonPath("$[0].blackPlayerName").value("opponent"))
                .andExpect(jsonPath("$[0].result").value("WHITE_WIN"));
        }

        @Test
        @DisplayName("Should represent unknown or deleted users as 'Guest' in match history")
        void shouldHandleGuestPlayersInMatchHistory() throws Exception {
            // Arrange
            Long userId = 1L;
            GameEntity history = GameEntity.builder()
                .id(101L)
                .whitePlayer(null)
                .blackPlayer(null)
                .result(GameResult.DRAW)
                .build();
            when(gameService.getGameHistory(userId)).thenReturn(List.of(history));

            // Act & Assert
            mockMvc.perform(get("/api/games/history/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].whitePlayerName").value("Guest"))
                .andExpect(jsonPath("$[0].blackPlayerName").value("Guest"));
        }

        @Test
        @DisplayName("Should return an empty collection when no match history is available")
        void shouldReturnEmptyListWhenNoHistoryExists() throws Exception {
            // Arrange
            when(gameService.getGameHistory(anyLong())).thenReturn(List.of());

            // Act & Assert
            mockMvc.perform(get("/api/games/history/{userId}", 99L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        }
    }
}
