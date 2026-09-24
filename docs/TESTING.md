# 🧪 Testing Strategy & Quality Assurance Guide
This document outlines the testing architecture, isolation strategies, and verification methodologies established for the **Chess Platform** full-stack ecosystem (Backend & Frontend).

---

## 🎯 Testing Philosophy & Architecture
Our testing pyramid ensures high reliability across all architectural layers by combining lightweight unit tests, isolated slice tests, containerized database integration checks, and reactive frontend component test suites.

* **Test Profile & Database Isolation:** All tests run under the `test` profile (`application-test.yml`), leveraging a **containerized PostgreSQL instance** running locally via Docker to guarantee true database behavior, dialect compatibility, and Liquibase schema validation.
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
Repository interfaces and database interactions are validated using Spring Boot integration tests inheriting from a centralized base configuration.

* **Database Layer (`UserRepositoryTest`, `GameRepositoryTest`, `AuditLogRepositoryTest`):**
    * Inherit from `AbstractIntegrationTest` which dynamically configures the datasource against the local Docker PostgreSQL container.
    * Leverages clean state management (`@BeforeEach` deletions) to avoid state pollution across test runs.

### 3. Web & API Layer Tests
REST controllers are tested using Spring's `MockMvc` framework to ensure proper HTTP status codes, payload serializations, and route mappings.

* **REST Validation (`GameRestControllerTest`, `AuditLogControllerTest`):**
    * Uses `@WebMvcTest` or `@SpringBootTest` with MockMvc to focus on request handling and JSON mapping.
    * Verifies endpoints for game initialization, legal move queries, match history retrieval, and admin audit log filters.

### 4. Frontend Component & Hook Tests
Frontend user interface components, interactive forms, custom hooks, and page dashboards are validated using **Vitest** and **React Testing Library (RTL)** running in a simulated `jsdom` environment.

* **Testing Standard & Code Discipline:** All component and hook test suites strictly follow the **Arrange-Act-Assert (AAA)** pattern with explicit code separation via comments to mirror backend testing clarity.
* **Component & Hook Validation (`ChessBoard`, `AuthForm`, `AdminDashboard`, `ProfileDashboard`, `useChessGameLogic`, `useChessActions`, `useChessTimer`, `useLobby`):**
    * Verifies initial rendering, user interactions (e.g., clicks, form validations, password visibility toggling), and asynchronous data loading states.
    * Mocks network boundaries and API services (`axios`, `adminService`, `userService`, `gameService`) to isolate UI behavior.

---

## 🚀 Running Tests Locally
Before running tests locally from your IDE or terminal, ensure that the dedicated **PostgreSQL Docker container** is up and running:

```bash
docker run --name chess-postgres -e POSTGRES_DB=chess_test_db -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres:15-alpine
```

### 🖥️ Running Frontend Tests
To execute the frontend unit and component test suites via Vitest, navigate to the `chess-frontend` directory and run:

```bash
cd chess-frontend
npm test
```

For continuous watch mode during frontend development:
```bash
cd chess-frontend
npm run test:watch
```

### ⚙️ JUnit Run Configuration Environment Variables
To successfully resolve security admin properties and container flags during test execution, configure the following **Environment Variables** in your IDE's JUnit template/configuration:
```text
DOCKER_API_VERSION=1.41;TESTCONTAINERS_RYUK_DISABLED=true;ADMIN_USERNAME=admin;ADMIN_EMAIL=admin@chess.com;ADMIN_PASSWORD=Admin123!
```

To execute the complete backend test suite via Maven from the chess-backend directory:
```text
./mvnw clean test
```

### 📊 Running Tests & SonarQube Analysis (PowerShell)
To execute the complete test suite along with the SonarQube analysis in a Windows PowerShell environment, set the required environment variables and run the following command from the `chess-backend` directory:

```powershell
$env:DOCKER_API_VERSION="1.41"; $env:TESTCONTAINERS_RYUK_DISABLED="true"; $env:ADMIN_USERNAME="admin"; $env:ADMIN_EMAIL="admin@chess.com"; $env:ADMIN_PASSWORD="Admin123!"; .\mvnw clean verify sonar:sonar "-Dsonar.projectKey=chess-platform" "-Dsonar.host.url=http://localhost:9002" "-Dsonar.token=your_sonar_token_here"
```
