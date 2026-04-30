package com.batuhan.chess;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.redisson.api.RedissonClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(ChessBackendApplicationTests.MockConfig.class)
class ChessBackendApplicationTests {

    @Test
    void contextLoads() {

    }

    @TestConfiguration
    static class MockConfig {

        @Bean
        public RedissonClient redissonClient() {
            return Mockito.mock(RedissonClient.class);
        }
    }
}
