package com.batuhan.chess.identity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * This test class ensures that the Spring Application Context loads successfully.
 * During testing, an H2 (in-memory) database is used instead of PostgreSQL
 * to provide an isolated and fast testing environment.
 */
@SpringBootTest
@ActiveProfiles("test")
class ChessBackendApplicationTests {

	@Test
	void contextLoads() {
		// This method will pass if the application context starts without any configuration errors.
		// It serves as a smoke test for the overall project setup.
	}
}
