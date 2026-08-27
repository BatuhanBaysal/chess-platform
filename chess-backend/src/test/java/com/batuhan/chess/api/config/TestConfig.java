package com.batuhan.chess.api.config;

import org.redisson.api.RedissonClient;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.withSettings;

@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    public RedissonClient redissonClient() {
        return mock(RedissonClient.class);
    }

    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        return mock(RedisConnectionFactory.class,
            withSettings().extraInterfaces(org.springframework.data.redis.connection.ReactiveRedisConnectionFactory.class));
    }

    @Bean
    @Primary
    @SuppressWarnings("unchecked")
    public RedisTemplate<String, Object> redisTemplate() {
        return (RedisTemplate<String, Object>) mock(RedisTemplate.class);
    }
}
