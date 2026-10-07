package com.batuhan.chess;

import org.redisson.api.RedissonClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.mockito.Mockito.mock;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(AbstractIntegrationTest.MockRedisConfig.class)
public abstract class AbstractIntegrationTest {

    @TestConfiguration
    static class MockRedisConfig {
        @Bean
        public RedissonClient redissonClient() {
            return mock(RedissonClient.class);
        }
    }
}
