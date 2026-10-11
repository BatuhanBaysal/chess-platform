# 🧪 Testing Strategy & Quality Assurance Guide
This document outlines the testing architecture, isolation strategies, and verification methodologies established for the **Chess Platform** full-stack ecosystem (Backend, Frontend, and End-to-End).

---

## 🎯 Testing Philosophy & Architecture
The testing pyramid combines lightweight unit tests, isolated slice tests, integration tests against a real database, reactive frontend component tests, and a Playwright end-to-end suite.

* **Test Profile & Database Isolation:** Backend tests run under the `test` profile (`application-test.yml`) against a real **PostgreSQL container** (`chess_test_db`) instead of an in-memory substitute, so tests exercise true database behavior, dialect compatibility, and Liquibase schema validation. Locally the container is started with Docker; in CI it runs as a GitHub Actions service container.
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
Repository interfaces and database interactions are validated with Spring Boot integration tests that inherit from a centralized base configuration.

* **Database Layer (`UserRepositoryTest`, `GameRepositoryTest`, `AuditLogRepositoryTest`):**
    * Inherit from `AbstractIntegrationTest`, which dynamically configures the datasource against the PostgreSQL test container.
    * Leverages clean state management (`@BeforeEach` deletions) to avoid state pollution across test runs.

### 3. Web & API Layer Tests
REST controllers are tested using Spring's `MockMvc` framework to ensure proper HTTP status codes, payload serializations, and route mappings.

* **REST Validation (`GameRestControllerTest`, `AuditLogControllerTest`):**
    * Uses `@WebMvcTest` or `@SpringBootTest` with MockMvc to focus on request handling and JSON mapping.
    * Verifies endpoints for game initialization, legal move queries, match history retrieval, and admin audit log filters.

### 4. Frontend Component & Hook Tests
Frontend components, interactive forms, custom hooks, and page dashboards are validated using **Vitest** and **React Testing Library (RTL)** in a simulated `jsdom` environment.

* **Testing Standard & Code Discipline:** All component and hook test suites follow the **Arrange-Act-Assert (AAA)** pattern with explicit separation via comments to mirror backend testing clarity.
* **Component & Hook Validation (`ChessBoard`, `AuthForm`, `AdminDashboard`, `ProfileDashboard`, `useChessGameLogic`, `useChessActions`, `useChessTimer`, `useLobby`):**
    * Verifies initial rendering, user interactions (clicks, form validation, password visibility toggling), and asynchronous data loading states.
    * Mocks network boundaries and API services (`axios`, `adminService`, `userService`, `gameService`) to isolate UI behavior.

### 5. End-to-End Tests (Playwright)
Playwright specs in `chess-frontend/e2e/` drive the real UI in a browser to verify critical user journeys end to end, such as authentication, starting an AI match, piece movement, and connection recovery. Configuration (base URL, web server settings) lives in `playwright.config.ts`. CI runs the suite on Chromium for every push and pull request.

---

## 📊 Coverage
Backend coverage is measured with **JaCoCo** during `mvn verify` and analyzed in SonarQube. Frontend coverage is not measured yet.

---

## 🚀 Running Tests Locally
Before running backend tests, start the dedicated PostgreSQL test container (same settings as the CI service container):

```bash
docker run --name chess-postgres-test -e POSTGRES_DB=chess_test_db -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres:15-alpine
```

> Port 5432 is also used by the `db` service in `docker-compose.yml`. Stop that service first, or map the test container to another port (for example `-p 5433:5432`) and adjust `CHESS_DB_URL` below.

### 🖥️ Running Frontend Tests
Unit and component tests (Vitest):

```bash
cd chess-frontend
npm test
```

Watch mode during development:

```bash
cd chess-frontend
npm run test:watch
```

End-to-end tests (Playwright):

```bash
cd chess-frontend
npm run test:e2e
```

### ⚙️ Backend Tests
Run the complete backend suite from the `chess-backend` directory (with the variables below set in your shell or IDE):

```bash
./mvnw clean test
```

**IDE run configuration (IntelliJ JUnit template).** Add these environment variables:

```text
CHESS_DB_URL=jdbc:postgresql://localhost:5432/chess_test_db;CHESS_DB_USERNAME=test;CHESS_DB_PASSWORD=test;ADMIN_USERNAME=admin;ADMIN_EMAIL=admin@chess.com;ADMIN_PASSWORD=Admin123!
```

The `CHESS_DB_*` values point the tests at the test container, keeping them away from your development database. The `ADMIN_*` values supply the admin bootstrap properties the Spring context needs during `@SpringBootTest`. All of these are test-only values; never reuse them in a deployed environment.

**Docker Desktop troubleshooting (Windows).** If Testcontainers cannot connect to Docker or fails during container cleanup, also set:

```text
DOCKER_API_VERSION=1.41;TESTCONTAINERS_RYUK_DISABLED=true
```

### 📊 Running Tests & SonarQube Analysis (PowerShell)
To run the test suite together with the SonarQube analysis on Windows PowerShell, start the `quality` profile first (`docker compose --profile quality up -d`), then run from the `chess-backend` directory:

```powershell
$env:CHESS_DB_URL="jdbc:postgresql://localhost:5432/chess_test_db"; $env:CHESS_DB_USERNAME="test"; $env:CHESS_DB_PASSWORD="test"; $env:DOCKER_API_VERSION="1.41"; $env:TESTCONTAINERS_RYUK_DISABLED="true"; $env:ADMIN_USERNAME="admin"; $env:ADMIN_EMAIL="admin@chess.com"; $env:ADMIN_PASSWORD="Admin123!"; .\mvnw clean verify sonar:sonar "-Dsonar.projectKey=chess-platform" "-Dsonar.host.url=http://localhost:9002" "-Dsonar.token=your_sonar_token_here"
```
