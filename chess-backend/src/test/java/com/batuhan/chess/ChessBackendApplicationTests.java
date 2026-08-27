package com.batuhan.chess;

import org.junit.jupiter.api.Test;
import org.redisson.api.RedissonClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@SpringBootTest
@ActiveProfiles("test")
@Import(ChessBackendApplicationTests.MockConfig.class)
class ChessBackendApplicationTests {

    @Autowired(required = false)
    private RedissonClient redissonClient;

    @Test
    void contextLoads() {
        assertThat(redissonClient).isNotNull();
    }

    @TestConfiguration
    static class MockConfig {

        @Bean
        public RedissonClient redissonClient() {
            return mock(RedissonClient.class);
        }
    }
}
