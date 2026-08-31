# 🧪 Testing Strategy & Quality Assurance Guide

This document outlines the testing architecture, isolation strategies, and verification methodologies established for the **Chess Platform** backend.

---

## 🎯 Testing Philosophy & Architecture

Our testing pyramid ensures high reliability across all architectural layers by combining lightweight unit tests, isolated slice tests, and database integration checks.

* **Test Profile Isolation:** All tests run under the `test` profile (`application-test.yaml`), leveraging an **H2 In-memory database** (`jdbc:h2:mem:chess_test_db`) configured in PostgreSQL compatibility mode to guarantee side-effect-free, lightning-fast execution without impacting local PostgreSQL instances.
* **Clean Code & Readability:** Utilizing **JUnit 5** (`@Nested`, `@DisplayName`, `@Test`) and **AssertJ**, test suites are structured into intuitive nested hierarchies that clearly document system behavior.

---

## 🧩 Testing Categories & Implementation

### 1. Unit & Domain Logic Tests
Domain models and application services are tested in strict isolation to validate core business rules and move calculation engines.

* **Mocking Strategy:** External dependencies (persistence, brokers, external APIs) are mocked using **Mockito** (`@Mock`, `@InjectMocks`).
* **Example (`GameServiceTest`, `GameTest`):**
    * Validates complex game creation workflows (player-vs-player and AI modes).
    * Verifies FIDE chess rule enforcement (e.g., Castling, En Passant, Threefold Repetition, Checkmate, and Stalemate detection).

### 2. Data JPA & Persistence Tests
Repository interfaces and database interactions are validated using Spring Boot slice tests.

* **Database Layer (`GameRepositoryTest`):**
    * Annotated with `@DataJpaTest` and `@ActiveProfiles("test")`.
    * Leverages `TestEntityManager` to persist mock entities and verify custom query behaviors, such as fetching games via EntityGraphs or sorting history chronologically.

### 3. Web & API Layer Tests
REST controllers are tested using Spring's `MockMvc` framework to ensure proper HTTP status codes, payload serializations, and route mappings.

* **REST Validation (`GameRestControllerTest`):**
    * Uses `@WebMvcTest` with security filters bypassed (`@AutoConfigureMockMvc(addFilters = false)`) to focus purely on request handling and JSON mapping.
    * Verifies endpoints for game initialization, legal move queries, match history retrieval, and AI session creation.

### 4. WebSocket & Real-Time Engine Tests
Real-time messaging components handling STOMP protocols are thoroughly verified for event-driven behavior.

* **WebSocket Controller (`GameWebSocketControllerTest`):**
    * Validates player readiness synchronization, move broadcasting via `SimpMessagingTemplate`, and robust error handling.
    * Ensures edge cases (e.g., null game states, disconnected players) throw predictable error maps instead of crashing the message broker.

---

## 🚀 Running Tests Locally

To execute the complete backend test suite and verify system integrity, run the following command from the `chess-backend` directory:

```bash
./mvnw clean test
```

Build Integration: These exact tests are automatically executed on every push and pull request via our GitHub Actions CI Pipeline (ci.yml), ensuring that no regression slips into the main branch.
