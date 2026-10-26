package com.batuhan.chess.api.controller;

import com.batuhan.chess.AbstractIntegrationTest;
import com.batuhan.chess.api.dto.game.GameResponse;
import com.batuhan.chess.api.dto.lobby.CreateRoomRequest;
import com.batuhan.chess.application.service.game.GameArtifactService;
import com.batuhan.chess.application.service.game.GameService;
import com.batuhan.chess.application.service.game.LobbyService;
import com.batuhan.chess.domain.model.chess.Game;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Game & Lobby Rate Limiting Integration Tests")
class GameRateLimiterIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RateLimiterRegistry rateLimiterRegistry;

    @MockitoBean
    private GameService gameService;

    @MockitoBean
    private LobbyService lobbyService;

    @MockitoBean
    private GameArtifactService artifactService;

    @MockitoBean
    private RedissonClient redissonClient;

    @MockitoBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockitoBean
    private RedisTemplate<String, Object> redisTemplate;

    @BeforeEach
    void setUp() {
        // Arrange
        rateLimiterRegistry.getAllRateLimiters().forEach(limiter -> {
            String name = limiter.getName();
            var config = limiter.getRateLimiterConfig();
            rateLimiterRegistry.remove(name);
            rateLimiterRegistry.rateLimiter(name, config);
        });
    }

    @Nested
    @DisplayName("AI Game Creation Rate Limit (gameCreationLimiter: 2/min)")
    class AiGameRateLimitTests {

        @Test
        @DisplayName("Should return 429 Too Many Requests when AI game creation limit is exceeded")
        void shouldExceedAiGameCreationLimit() throws Exception {
            // Arrange
            Game mockGame = mock(Game.class);
            GameResponse mockResponse = mock(GameResponse.class);

            when(gameService.createAiGame(anyLong(), anyBoolean(), anyInt(), any())).thenReturn("ai-game-1");
            when(gameService.getGame("ai-game-1")).thenReturn(mockGame);
            when(gameService.convertToResponse(eq("ai-game-1"), any(Game.class))).thenReturn(mockResponse);

            var userAuth = jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"));

            // Act & Assert
            for (int i = 0; i < 2; i++) {
                ResultActions successResult = mockMvc.perform(post("/api/games/vs-ai")
                    .param("userId", "10")
                    .param("playAsWhite", "true")
                    .param("difficulty", "3")
                    .with(userAuth));

                successResult.andExpect(status().isOk());
            }

            // Act
            ResultActions rateLimitedResult = mockMvc.perform(post("/api/games/vs-ai")
                .param("userId", "10")
                .param("playAsWhite", "true")
                .param("difficulty", "3")
                .with(userAuth));

            // Assert
            rateLimitedResult.andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value("Too many requests. Please wait a moment."));
        }
    }

    @Nested
    @DisplayName("Lobby Room Creation Rate Limit (gameCreationLimiter: 2/min)")
    class LobbyRoomRateLimitTests {

        @Test
        @DisplayName("Should return 429 Too Many Requests when lobby room creation limit is exceeded")
        void shouldExceedLobbyRoomCreationLimit() throws Exception {
            // Arrange
            CreateRoomRequest request = new CreateRoomRequest(10L, "player1", 10, "classic");
            when(lobbyService.createRoom(anyLong(), anyString(), anyInt(), anyString())).thenReturn("room-123");
            String payload = objectMapper.writeValueAsString(request);

            // Act & Assert
            for (int i = 0; i < 2; i++) {
                ResultActions successResult = mockMvc.perform(post("/api/lobby/create")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload));

                successResult.andExpect(status().isOk());
            }

            // Act
            ResultActions rateLimitedResult = mockMvc.perform(post("/api/lobby/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload));

            // Assert
            rateLimitedResult.andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value("Too many requests. Please wait a moment."));
        }
    }
}
