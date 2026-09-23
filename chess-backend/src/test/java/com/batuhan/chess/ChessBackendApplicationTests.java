package com.batuhan.chess;

import org.junit.jupiter.api.Test;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@TestPropertySource(properties = {
    "ADMIN_USERNAME=admin",
    "ADMIN_EMAIL=admin@chess.com",
    "ADMIN_PASSWORD=Admin123!"
})
class ChessBackendApplicationTests extends AbstractIntegrationTest {

    @Autowired(required = false)
    private RedissonClient redissonClient;

    @Test
    void contextLoads() {
        assertThat(redissonClient).isNotNull();
    }
}
