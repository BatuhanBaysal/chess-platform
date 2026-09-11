# 📜 Changelog

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Project Lifecycle Governance Note:**
> All development milestones, release tags, and version history have been retroactively configured to align with our production-ready lifecycle. This project is developed using **Professional Agile methodologies**, utilizing **GitHub Projects (Kanban Board)** for end-to-end task management—encompassing the full scope from backlog refinement to continuous delivery and stable production releases.

## 🚀 Development Roadmap

- ✅ **Phase 1: Foundation** 🏗️ - Monorepo scaffolding, environment setup, and Spring Boot/React initialization.
- ✅ **Phase 2: Domain Modeling** ♟️ - Piece-specific logic, board initialization, and DDD-based movement rules.
- ✅ **Phase 3: Rule Engine** ⚖️ - Legal move validation (King safety, check/mate detection) and FIDE standards.
- ✅ **Phase 4: Communication Layer** 📡 - WebSocket infrastructure using STOMP protocol and real-time event mapping.
- ✅ **Phase 5: UI Integration & Local Play** 🖥️ - Interactive React 19 board, Pawn Promotion, and Castling UI.
- ✅ **Phase 6: Visual Polish & UX** 🎨 - Dark/Light mode, theme support (Classic, Modern, Emerald), and Drag & Drop (`dnd-kit`).
- ✅ **Phase 7: Identity & Persistence** 🔐 - Implemented **Spring Security + JWT**, User profiles, and PostgreSQL integration.
- ✅ **Phase 8: Server-Side Authority** 🛡️ - Hardened backend validation for all moves and anti-cheat state management.
- ✅ **Phase 9: Remote Multiplayer & Matchmaking** 🤝 - Global session management and real-time player pairing via WebSockets.
- ✅ **Phase 10: Infrastructure & Containerization** 🐳 - Orchestrating services with **Docker & Docker Compose** and implementing **Liquibase** for DB versioning.
- ✅ **Phase 11: Full-Stack Observability (LGTM)** 📈 - Implementing **Grafana, Loki, and Prometheus** for real-time logs, metrics, and system health.
- ✅ **Phase 12: Quality Assurance & Code Integrity** 🏆 - Expanding **JUnit 5/Mockito** coverage and integrating **SonarQube** for automated "Zero Technical Debt" reporting.
- ✅ **Phase 13: Scalability & Resilience** ⚡ - Implementing **Resilience4j** (Circuit Breaker) and **Distributed Locking** with Redis.
- ✅ **Phase 14: Core Engine Refactoring & UX Optimization** ⚙️ - Server-authoritative timer logic and enhanced UI responsiveness/notation feed.
- ✅ **Phase 15: Official Stable Release (v1.0.0)** 🚀 - Production-ready engine, OpenAPI/Swagger docs, and enhanced observability.
- ✅ **Phase 16: User Experience & Dashboards (v1.1.0)** 📈 - Secure user profiles, RBAC authorization, and interactive performance analytics.
- ✅ **Phase 17: Administration & Operations** 👑 - Developing an RBAC-integrated Admin Dashboard to manage users, monitor health, and oversee global platform operations.
- ✅ **Phase 18: Security, Resilience & Quality** 🛡️ - Hardening game state integrity by enforcing a "Dismiss = Loss" policy within the WebSocket reconnection handler.
- ✅ **Phase 19: AI Integration & Training Ecosystem (v2.0.0)** 🤖 - Integrating the Stockfish engine via UCI protocol to enable real-time move analysis, blunder detection, and hint mechanisms.
- ✅ **Phase 20: Enterprise Refactoring & Production Readiness (v2.1.0)** ⚡ - Domain-driven vertical slicing, performance optimization, and rigorous security audits for production deployment.
- ✅ **Phase 21: Production Deployment & Cloud Demo (v2.2.0)** ☁️ - Provisioning multi-container environments, setting up Vercel static hosting, and deploying the full backend, database, SonarQube, and LGTM observability stack via Docker Compose on Oracle Cloud.
- ⏳ **Phase 22: Enterprise Data & Identity Management (v2.3.0)** 🔑 - Integrating MinIO object storage for artifacts and Keycloak for centralized OAuth2/OIDC RBAC security.
- 🔜 **Phase 23: Asynchronous Eventing & Observability (v2.4.0)** ⚡ - Decoupling heavy Stockfish analysis tasks via RabbitMQ and integrating OpenTelemetry with the LGTM stack.
- 🔜 **Phase 24: Quality Assurance & Advanced Scaling (v2.5.0)** 🧪 - Implementing automated Playwright E2E testing, Redis Cluster session synchronization, and local Kubernetes manifests.
- 🔜 **Phase 25: Final Polish, Strict Typing & UX Refinement (v2.6.0)** 💎 - Enforcing strict TypeScript DTO alignment, resolving runtime micro-bugs, and maximizing interface consistency.

---

## [2.3.0] - 2026-09-11

### 📦 Phase 22: Enterprise Data & Identity Management 🗄️ (v2.3.0)
> **Note:** Decoupling file management via S3-compatible cloud storage (MinIO locally and OCI Object Storage in production) and centralizing IAM authentication via Keycloak OAuth2/OIDC.

- **2026-09-11:**
    - **Integrate MinIO and AWS S3 SDK for File Operations (PR #158 | Issue #156):**
        - Added ARM and x86-64 compatible MinIO container alongside persistent volume storage in `docker-compose.yml` for local development.
        - Integrated AWS SDK v2 (`software.amazon.awssdk:s3`) with configurable path-style access to support both local MinIO and production OCI Object Storage transparently via `S3Properties` and `S3Config`.
        - Implemented `FileStoragePort` domain repository interface and `S3StorageAdapter` following Hexagonal Architecture principles.
        - Extended `UserService` and `UserController` with endpoints (`POST /api/users/me/avatar`, `GET /api/users/{username}/avatar`) and validation for avatar image uploads and downloads.
        - Developed `GameArtifactService` and updated `GameRestController` to support PGN game record exports (`GET /api/games/{gameId}/export/pgn`) and raw telemetry artifact storage.
        - Resolved a Windows runtime file-locking issue in `StockfishService` test extraction by switching to dynamic `.exe` resolving and skipping existing binary overwrites.
        - Added comprehensive unit, contract, and mock tests covering storage adapters, services, configuration beans, and DTO records.

---

## [2.2.0] - 2026-09-08

### 🚀 Phase 21: Production Deployment & Cloud Demo ☁️ (v2.2.0)
> **Note:** Provisioning multi-container environments, setting up Vercel static hosting, and deploying the full backend, database, and observability stack via Docker Compose on Oracle Cloud.

- **2026-09-08:**
    - **Install Vercel Web Analytics (PR #155):**
        - Integrated `@vercel/analytics` package into the React frontend application layout to track page views and visitor metrics.

- **2026-09-07:**
    - **Fix Configuration and Application Yaml Files (PR #154):**
        - Refined SSH connection instructions in `README.md` for clearer Oracle Cloud server access guidelines.
        - Updated `application-local.yaml` and `application.yaml` to include dynamic environment mappings for JWT configuration and admin credentials (`ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
        - Updated `docker-compose.yml` service configurations to link environment files and optimize backend actuator health check parameters.
    - **Implement Secure Environment-Driven Administration and Production Configuration (PR #153):**
        - Added automated `AdminSeeder` component implementing `CommandLineRunner` to securely provision default administrator credentials from environment variables (`ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) on application startup.
        - Refactored frontend and backend configurations (`SecurityConfig`, `WebSocketConfig`, `Footer.tsx`, `Header.tsx`, `SystemHealth.tsx`) to support dynamic environment URLs and hide debugging tools in production using the `VITE_SHOW_MONITORING` flag.
        - Updated `.env.example` templates to include comprehensive configurations for database settings, JWT expiration (standardized to 7 days / `604800000` ms), Grafana passwords, and multi-environment frontend endpoints.
    - **Add Stockfish Multi-Platform Binaries and Execution Path (PR #152):**
        - Integrated multi-platform Stockfish binaries into the repository and updated the execution path logic to dynamically detect and load platform-appropriate engine executables.
        - Ensured seamless out-of-the-box cross-platform support for local development environments and target deployment hosts without requiring manual binary setup.
    - **Update URL Routing, Integrate Stockfish AI Gameplay and Hint Features (PR #151):**
        - Refactored frontend URL routing structures and integrated full Stockfish AI gameplay modes with real-time hint capabilities.
        - Enhanced user interaction flows for playing against the engine directly within the platform interface.
    - **Fix Stockfish Engine Process Stream Synchronization and Buffer Management (PR #150):**
        - Updated the `StockfishService` implementation to properly consume and clear initial process startup outputs (`uciok`, `readyok` etc.) inside `initializeProcessStreams`.
        - Prevented protocol synchronization drift and dangling buffer states that previously caused `Stream closed` or `Broken pipe` exceptions during early engine communication.
        - Ensured robust and reliable process execution and stream handling for local Windows environments during pre-warming and gameplay evaluations.

- **2026-09-06:**
    - **Implement Bean-Based CORS Configuration Source for Security Filter Chain (PR #149):**
        - Configured an explicit bean-based `CorsConfigurationSource` to integrate cleanly with Spring Security, ensuring proper evaluation order for incoming cross-origin requests.
    - **Update Security Config for CORS Preflight Options and Nginx Settings (PR #148):**
        - Updated the backend security filter chain configuration to properly handle CORS preflight (`OPTIONS`) requests and adjusted Nginx reverse proxy settings to correctly pass headers.
    - **Update Axios BaseURL to Dynamic Environment Variable (PR #147):**
        - Refactored the frontend API client configuration to use a dynamic environment variable for the Axios `baseURL`, allowing seamless configuration across local development and production environments.
    - **Finalize CORS Policies, Secure WebSockets, and End-to-End System Health (PR #146 | Issue #145):**
        - Finalized and fine-tuned CORS policies in the Spring Boot backend to explicitly allow production cross-origin requests from the Vercel-hosted frontend to the Oracle Cloud infrastructure.
        - Configured and validated secure WebSocket (`wss://`) handshake endpoints to ensure real-time communication operates cleanly without mixed-content or SSL blockages.
        - Performed end-to-end system health checks, verifying container metrics, API response times, and live telemetry through Grafana dashboards.

- **2026-09-04:**
    - **Multi-Container Backend Deployment via Docker Compose (PR #143 | Issue #142):**
        - Developed optimized multi-stage Dockerfiles tailored for the Spring Boot backend running on ARM architecture.
        - Configured production environment variables (`.env`) and deployed the full backend, database, and monitoring services stack via Docker Compose on Oracle Cloud.

- **2026-09-02:**
    - **Oracle Cloud Infrastructure & Firewall Provisioning (Issue #141):**
        - Provisioned an Oracle Cloud Always Free ARM (Ampere) virtual private server running Ubuntu 24.04 with Docker engine and Docker Compose installed.
        - Configured Virtual Cloud Network (VCN) security lists and host UFW firewall rules to securely expose necessary ports (e.g., 22, 80, 443, 8088, 3000, 9000).

- **2026-09-01:**
    - **Vercel Static Hosting & Frontend Deployment (Issue #140):**
        - Configured Vite build targets and connected the React 19 frontend repository to Vercel for automated continuous deployments.
        - Verified that production builds successfully execute and public URLs resolve the client application accurately.

---

## [2.1.0] - 2026-08-31

### 🚀 Phase 20: Enterprise Refactoring & Production Readiness 🏗️ (v2.1.0)
> **Note:** Elevating backend architecture through domain-driven vertical slicing, decoupling monolithic services, and ensuring real-time production reliability.

- **2026-08-31:**
    - **Technical Documentation Overhaul & Engineering Case Studies (PR #139 | Issue #135):**
        - Updated core markdown documentation (`ARCHITECTURE.md`, `DEVELOPMENT.md`, etc.) to fully reflect v2.1.0 changes, system architecture, and local Docker-based infrastructure setup.
        - Authored comprehensive engineering case study assets detailing solved technical challenges, including server-authoritative move validation, concurrency management, and thread-safe telemetry handling.
        - Verified OpenAPI/Swagger documentation accuracy to ensure all REST and WebSocket endpoints are precisely mapped for developer reference and technical reviews.

- **2026-08-30:**
    - **Transaction Boundaries, ACID Compliance & Distributed Locks Implementation (PR #138 | Issue #134):**
        - Enforced strict `@Transactional` boundaries, transaction propagation, and Redisson distributed locks across critical paths (`LobbyService` and `GameEngineService`) to eliminate race conditions during simultaneous lobby joins and move submissions.
        - Secured database integrity under simultaneous multi-user interactions and validated atomic state consistency during active game sessions.
        - Comprehensive unit testing coverage added to validate lock acquisition safety, timeout behaviors, and concurrency rules under simulated multi-threaded operations.

- **2026-08-29:**
    - **Maven Dependency Audit, Build Plugin Consolidation & Build Pipeline Optimization (PR #137 | Issue #130):**
        - Audited and consolidated Maven dependencies in `pom.xml`, maintaining stable and secure library versions while safely declining risky or incompatible major upgrades (such as unstable Spring Boot 4 versions) to prevent downstream compilation errors.
        - Resolved build plugin warnings and optimized build configuration files, including modernizing Vite configuration standards (`import.meta.dirname`) to ensure completely clean build outputs and future-proof project tooling.
        - Verified that multi-stage Docker builds successfully compile, package, and containerize the application with zero deprecation warnings related to updated core libraries.

- **2026-08-27:**
    - **Comprehensive Backend Test Suite Expansion & Domain Refactoring (PR #133 | Issue #129):**
        - Significantly expanded backend unit, configuration, controller, and integration test suites (including new tests for Redis config, audit log aspects, WebSocket configurations, game broadcast managers, and domain repositories) to fulfill v2.1.0 release quality gates.
        - Refactored core application and domain services (`AuthService`, `GameEngineService`, `GamePersistenceService`, `GameTimerService`, `StockfishService`, etc.) alongside domain models to ensure absolute test reliability, prevent regressions, and guarantee concurrency safety for chess rule evaluations and API services.

- **2026-08-26:**
    - **Robust WebSocket Reconnection, Error Boundary & UI/UX Enhancements (PR #132 | Issue #128):**
        - Implemented robust client-side reconnection strategies and error boundaries to ensure the application gracefully handles WebSocket disconnections and unexpected UI rendering states without data loss or stuck components.
        - Added system health checking (`/api/auth/health`) with automated ping monitoring and CORS support for `HEAD` and `GET` requests to maintain real-time backend connection visibility.
        - Refactored UI layouts, navigation structures, and modal components including the addition of `ErrorBoundary`, `About`, `Changelog`, `Contact`, and `SystemHealth` views for an upgraded production-grade user experience.
        - Harmonized security configuration (`SecurityConfig`) and authentication endpoints (`AuthController`) to permit unsecure operational checks while maintaining stringent JWT-based security policies for core platform features.

- **2026-08-25:**
    - **Frontend Enterprise Architecture Refactoring & Modular UI Componentization (PR #131 | Issue #123):**
        - Decoupled monolithic `ChessBoard` and oversized custom hooks (`useChess`) into granular, single-responsibility presentational components and modular hooks (`useChessGameLogic`, `useChessActions`, `useChessSocket`, `useChessTimer`) to isolate state management and side-effects.
        - Redesigned the active match interface layout by consolidating left-side elements (Stockfish evaluation, clocks, captured pieces) into a unified panel, and combining right-side telemetry and move notation elements into an intuitive tabbed panel system.
        - Integrated clean routing architecture (`AppRoutes`) across application features, enhancing client-side navigation security and clean URL management.
        - Refactored UI component hierarchies and styling layers across menus, game views, authentication modules, and user dashboards to boost rendering performance, maintainability, and visual responsiveness.

- **2026-08-21:**
    - **Core Business Logic Optimization & Stockfish Integration Refactoring (PR #126 | Issue #122):**
        - Refactored `GameEngineService` and `StockfishService` to transition blocking synchronous operations into fully asynchronous execution paths utilizing `CompletableFuture`.
        - Optimized core game state evaluation to ensure thread safety, eliminate concurrency bottlenecks, and prevent latency spikes during intense multi-user gaming sessions.
        - Introduced a robust concurrency test suite (`StockfishConcurrencyTest`) to simulate simultaneous game evaluations and engine requests, guaranteeing race-condition and deadlock-free performance.
        - Cleaned up supporting configuration classes, services, and tests to achieve seamless integration and production-ready real-time multiplayer reliability.

- **2026-08-20:**
    - **Controller-Service Harmonization & Global Exception Handling (PR #125 | Issue #121):**
        - Centralized error management by implementing a robust `GlobalExceptionHandler` to capture custom and runtime exceptions into a unified `ErrorResponse` structure.
        - Fully updated and harmonized all REST controllers (`AdminController`, `AuditLogController`, `AuthController`, `GameRestController`, `GameWebSocketController`, `LobbyController`, `UserController`) to ensure standardized contracts with the service layer.
        - Refactored request DTOs (`LoginRequest`, `DismissRequest`, `HeartbeatRequest`, `DeleteAccountRequest`, `ReadyRequest`, and new lobby DTOs) and enforced strict payload validation using `@Valid` and Bean Validation annotations across all endpoints.
        - Updated core application services (`AdminService`, `AuthService`, `GameService`, `LobbyService`, `UserService`) to align seamlessly with standardized error contracts and request validation flows.
        - Expanded comprehensive unit and controller test suites (`GlobalExceptionHandlerTest`, `AdminControllerTest`, `GameWebSocketControllerTest`, `LobbyControllerTest`, service tests) to guarantee predictable client-side error handling and robust API reliability.

- **2026-08-19:**
    - **Enterprise Refactoring, Domain Modularization & Real-Time Synchronization (PR #124 | Issue #120):**
        - Refactored the monolithic `GameService` God class into modular, single-responsibility components (`GameTimerService`, `GameSessionManager`, `GamePersistenceService`, `GameEngineService`, and `GameBroadcastManager`) adhering to the Single Responsibility Principle.
        - Integrated `GameBroadcastManager` into the global timer loop to support continuous, throttled WebSocket updates (`150ms`) for active match timers and UI state synchronization.
        - Stabilized real-time clock countdowns and prevented premature UI rendering resets or unexpected closures of private features like the AI assistant hint panel during active matches.
        - Expanded comprehensive unit and integration test suites to validate refactored game domain services, concurrent move safety, and ACID compliance under simultaneous user interactions.

---

## [2.0.0] - 2026-08-14

### 🚀 Phase 19: AI Integration & Training Ecosystem 🤖 (v2.0.0)
> **Note:** Expanding the training ecosystem with automated computer opponent capabilities powered by the Stockfish chess engine.

- **2026-08-14:**
    - **Stockfish Real-Time Telemetry & Performance Optimization (PR #117 | Issue #114):**
        - Implemented throttled broadcasting (`150ms`) and thread-safe data structures (`ConcurrentHashMap`) in `GameService` to manage high-frequency Stockfish telemetry data and prevent network/socket congestion.
        - Optimized frontend `useChess` hook and dynamic components like `EvaluationBar` for smooth, stutter-free rendering under heavy WebSocket data streams.
        - Enhanced WebSocket connection resilience with exponential backoff reconnection and heartbeat mechanisms.
        - Added comprehensive unit and integration tests (`StockfishServiceTest`, `GameServiceTest`) to validate high-frequency engine outputs, throttling mechanisms, and session cleanup workflows.

- **2026-08-12:**
    - **Stockfish Engine Evaluation, Hints & Move Quality Tagging (PR #116 | Issue #113):**
        - Implemented Stockfish engine evaluation and hint mechanisms across backend services, controllers, and frontend analytics UI.
        - Added automated blunder, mistake, and inaccuracy indicators directly into the move notation history list.
        - Introduced the `EvaluationBar` component for visual centipawn and mate score representation.
        - Added comprehensive unit and integration tests (`EvaluationTests`, `EngineHintTests`, and `EngineHintControllerTests`) to validate engine evaluation and hint features.

- **2026-08-11:**
    - **Play vs AI Time Control & Enhancements (PR #115 | Issue #112):**
        - Updated the `/api/games/vs-ai` backend endpoint and `GameService` to accept and enforce custom `timeLimit` parameters (e.g., 3, 10, or 30 minutes) selected from the main menu.
        - Refined backend AI trigger methods and lobby time resolution logic to ensure single-player sessions initialize with accurate user-configured durations.
        - Updated the frontend `useChess` hook and `LandingPage` components to securely forward time control and difficulty settings to the AI initialization pipeline.
        - Fixed and aligned unit test parameter definitions to match the updated service method signatures.

- **2026-08-07:**
    - **Stockfish Chess Engine Integration (PR #108 | Issue #107):**
        - Implemented `StockfishService` to manage UCI protocol communication, process lifecycle, and engine execution.
        - Bundled the Stockfish binary (`chess-backend/src/main/resources/engine/stockfish.exe`) into backend resources for robust local and environment-agnostic support.
        - Integrated AI move triggers into `GameService` to automatically calculate and respond with best moves during single-player sessions.
        - Created the `/api/games/vs-ai` endpoint to initialize player-vs-AI game sessions with selectable player colors.
        - Added comprehensive unit and integration tests across `StockfishServiceTest`, `GameServiceTest`, and `GameRestControllerTest` to validate move accuracy, process lifecycle, and controller workflows.

---

## [1.2.0] - 2026-08-05

### 🚀 Phase 18: Security, Resilience & Quality 🛡️ (v1.2.0)
> **Note:** Hardening game state integrity by enforcing a "Dismiss = Loss" policy within the WebSocket reconnection handler.

- **2026-08-05:**
    - **Lobby Management & Ghost Game Prevention (PR #106 | Issue #101):**
        - Added the `cancelRoom` method to `LobbyService` to handle room cancellation and clean up active registry states.
        - Strengthened `joinRoom` logic in `LobbyService` to prevent joining expired, cancelled, or non-waiting rooms, ensuring robust ghost game prevention.
        - Created a DELETE `/api/lobby/cancel/{roomId}` endpoint in `LobbyController` to process room cancellation requests securely.
        - Added comprehensive unit tests (`RoomCancellationTests` nested classes) in both `LobbyServiceTest` and `LobbyControllerTest` to validate successful cancellations and unauthorized security checks.
        - Integrated `cancelLobby` API support within `gameService.ts` and standardized parameter naming to `timeLimit?: number` across the frontend landing interface.
        - Implemented real-time lobby synchronization ensuring that cancelled rooms are immediately removed from the user interface menu to block unauthorized connections.

- **2026-08-04:**
    - **Administrative Audit Logging & Action Tracking (PR #105 | Issue #100):**
        - Added an `audit_logs` database table via Liquibase migration to track all platform-wide administrative actions.
        - Created the `AuditLog` entity, `AuditLogRepository`, and `AuditLogService` to support backend logging operations.
        - Implemented an AOP `AuditLogAspect` component with the `@AuditableAction` annotation to automatically intercept sensitive admin operations (`TOGGLE_USER_STATUS`, `FORCE_FINISH_GAME`, and `PLAYER_DISMISS_GAME`).
        - Exposed a secure, paginated, and filterable `GET /api/admin/audit-logs` endpoint via `AuditLogController` restricted to `ROLE_ADMIN` users.
        - Integrated the audit logging service (`auditService.ts`) and added a dedicated, read-only "Audit Logs" tab with a paginated Data Grid inside the Admin Dashboard UI.

- **2026-08-03:**
    - **Game Abandonment & Session Dismissal Logic (PR #104 | Issue #99):**
        - Updated the `WebSocketReconnectionHandler` to treat the `Dismiss` signal as a terminal state.
        - Configured the database to register an immediate loss record for the player triggering the game dismissal.
        - Implemented backend mechanics for WebSocket disconnection and game session abandonment.
        - Integrated frontend updates to disable game links and remove connection buttons for dismissed sessions.

- **2026-07-29:**
    - **Watchdog Heartbeat & Ghost Game Resolution (PR #103 | Issue #97):**
        - Implemented a backend-driven Watchdog heartbeat monitoring mechanism to track player activity via WebSockets and prevent active sessions from remaining indefinitely locked.
        - Configured a 30-second timeout threshold to automatically transition abandoned games to a finished state with a loss for the disconnected player.
        - Integrated a client-side periodic ping mechanism (every 10 seconds) within the React `useChess` hook to maintain stable socket session handshakes.

### 🚀 Phase 17: Platform Governance & Resilience (v1.2.0)
> **Note:** This milestone establishes centralized operational oversight and administrative governance to ensure robust platform stability.

- **2026-07-23:**
    - **Admin Dashboard & Operational Control Center (PR #102 | Issue #96):**
        - Implemented a secure `/admin` route protected by an RBAC guard, restricting access exclusively to `ROLE_ADMIN` users.
        - Created dynamic data grids for comprehensive user management (including status resets and soft-delete capabilities) and live tracking of active game sessions.
        - Integrated a Developer Sandbox section to trigger and troubleshoot specific game state testing routines efficiently.
      
---

## [1.1.0] - 2026-07-14

### 🚀 Phase 16: User Experience & Dashboards (v1.1.0)
> **Note:** This milestone marks the project's evolution from a purely functional game engine to a modern, analytical web application.

- **2026-07-14:**
    - **Interactive Performance Analytics (PR #95 | Issue #88):**
        - Integrated a JavaScript data visualization module to render ELO progression and performance distributions.
        - Enforced a strict maximum boundary of the last 5 activities on the central profile view, with a "View All Data" redirect for comprehensive history.

- **2026-07-13:**
    - **Global Leaderboard Integration (PR #95 | Issue #88):**
        - Implemented a global leaderboard feature accessible via the main menu.
        - Added backend ranking and analytics endpoints to support the "View All" scoreboard functionality

- **2026-07-09:**
    - **Security & RBAC Architecture (PR #94 | Issue #93):**
        - Migrated authentication system from a legacy `isGuest` boolean flag to a robust Role-Based Access Control (RBAC) architecture.
        - Enforced strict authorization for `ROLE_USER`, `ROLE_GUEST`, and `ROLE_ADMIN` enums to eliminate unauthorized UI visibility.
        - Implemented mandatory session invalidation for critical profile updates and reinforced email format validation.

- **2026-07-08:**
    - **Profile & Account Management (PR #92 | Issue #87):**
        - Implemented `ProfileDashboard` with toggleable read-only/edit states and client-side "dirty checking" to optimize backend transactions.
        - Updated `GameService` to expose statistics for profile display.

- **2026-07-04:**
    - **User Service Refactoring (PR #91 | Issue #86):**
        - Decoupled user profile operations into a secure `UserService` to prevent direct repository access.
        - Implemented `GET/PUT /api/users/me` endpoints with Jakarta validation.
        - Configured `Resilience4j` rate-limiting and `@CacheEvict` for secure, performant account updates.

---

## [1.0.0] - 2026-06-19

### 🚀 Phase 15: Official Stable Release (v1.0.0)
> **Note:** This milestone marks the official transition of the project to its first production-ready, stable state. We have completed the core engine, secured the API, and implemented comprehensive observability.

- **2026-06-19:**
    - **Stable Production Foundation & Documentation (PR #50 | Issue #46):**
        - **Documentation Overhaul:**
            - Finalized comprehensive project documentation for the v1.0.0 stable release to ensure maintainability and user onboarding efficiency.
            - Restructured infrastructure monitoring files into `deploy/monitoring/` and integrated new `loki-config.yml` for improved observability.
            - Updated gameplay feature assets in `docs/assets/` to reflect the latest UI/UX state.
            - Introduced `pull_request_template.md` to enforce code review standards.
            - **Added visual walkthroughs and gameplay highlights (`v1-auth-workflow.mp4`, `v1-lobby-navigation.mp4`, `v1-gameplay-board.mp4`, and `v1-gameplay-highlight.gif`) to `docs/assets/videos/` for enhanced project demonstration.**
        - **API Observability & Documentation:**
            - Integrated **Swagger UI (OpenAPI 3)** for automated, interactive API documentation.
            - Configured `springdoc-openapi` to expose endpoints at `/swagger-ui.html`, ensuring seamless developer onboarding and API exploration.
    - **Project Governance & Standards (PR #49, #48):**
        - Formalized contributor guidelines and community standards by creating `CODE_OF_CONDUCT.md`.
        - Implemented standardized issue templates to streamline developer contributions and bug reporting.

- **2026-06-16:**
    - **Core Engine Stabilization & Persistence (PR #45 | Issue #44):**
        - **End-Game Logic Optimization:**
            - Implemented reliable end-game persistence and finish logic to guarantee data integrity.
            - The `handleFinishLogic` method was updated to use `Propagation.REQUIRES_NEW` for independent saving and `saveAndFlush()` for immediate persistence.
        - **Robustness Improvements:**
            - Addressed an issue where game state was not persisting correctly upon checkmate.
            - Applied fix to prevent premature cleanup or reset on checkmate, ensuring board representation persists in the UI.
        - **Validation:**
            - Conducted full ruleset validation, including checkmate detection, stalemates, and time controls.
            - Validated secure JWT-based authentication with integrated rate-limiting for production-level protection.

---

## [0.14.0] - 2026-06-13

### ⚡ Phase 14: Core Engine Refactoring & UX Optimization
> **Note:** This phase transitions the game engine to a server-authoritative timer model, ensuring absolute synchronization across clients. It further enhances the user interface by improving real-time responsiveness and visual feedback loops.

- **2026-06-13:**
    - **Frontend Architecture & Navigation Refactor (PR #43 | Issue #41):**
        - **Modular Directory Architecture:**
            - Migrated to a feature-based directory structure (`features/` vs. `components/`) to decouple UI atoms from domain-specific business logic.
        - **Enhanced Authentication UX:**
            - Refined `AuthContainer` and `AuthForm` integration with state-driven validation and improved form responsiveness.
            - Introduced auto-focus mechanics for Login/Register forms for streamlined user onboarding.
            - Integrated password security enhancements including visibility toggles and real-time password strength indicators.
        - **Navigation & Layout Modernization:**
            - Consolidated `Dashboard`, `LandingPage`, and `MatchHistory` into a cohesive feature module.
            - Implemented a fixed global header and persistent footer; added user profile integration (Name display & Sign-out) to the navigation menu.
            - Added "Return to Menu" navigation action within the `ChessBoard` header to optimize session flow.
        - **Chess Engine UI Refinements:**
            - Redesigned the Pawn Promotion modal for better interaction fidelity and user feedback.
            - Synchronized clock/timer visuals and updated telemetry indicators.
            - Applied standardized color schemes across all board components to improve visual consistency.
        - **Validation:**
            - Verified directory structure alignment with the new feature-based architecture.
            - Confirmed responsiveness and stability of the Auth/Nav flow across multiple viewports.
            - Validated layout stability with fixed-header content padding adjustments.
- **2026-06-05:**
    - **Core Engine Refactoring & Synchronization (PR #42 | Issue #40):**
        - **Server-Authoritative Clock:** Migrated game-time tracking logic from the frontend to `GameService` and backend entities, eliminating client-side latency discrepancies.
        - **WebSocket Broadcast Optimization:** Refined the event pipeline to ensure low-latency, atomic state synchronization of game clocks.
        - **Telemetry & Observability:** Integrated clock heartbeat tracking into the existing LGTM stack to monitor timer stability and synchronization accuracy in real-time.
        - **Validation:**
            - Verified timer accuracy against high-precision server-side timestamps.
            - Confirmed cross-session synchronization during simulated high-traffic scenarios.
            - Validated heartbeat visualization within the Grafana monitoring dashboard.

---

## [0.13.0] - 2026-04-30

### ⚡ Phase 13: Scalability & Resilience
> **Note:** This phase hardens the system against high-load scenarios and potential service failures. By integrating **Resilience4j** for fault tolerance and **Redisson** for distributed concurrency control, the platform ensures transactional integrity and system stability even under adverse conditions.

- **2026-04-30:**
    - **Enterprise Reliability & Concurrency Hardening (PR #39 | Issue #38):**
        - **Resilience4j Fault Tolerance:**
            - Implemented **Circuit Breaker** in `GameService` (10-call sliding window, 50% threshold) to prevent cascading failures.
            - Established **Rate Limiter** in `AuthService` (5 requests/sec) to mitigate brute-force and resource exhaustion.
            - Developed professional **Fallback Mechanisms** for graceful degradation and user feedback.
        - **Redisson Distributed Locking:**
            - Replaced local locks with **Redis-based Distributed Locks** (`RLock`) to ensure atomicity across multiple backend nodes.
            - Secured critical sections: Move execution, game-finish processing, and ELO updates.
        - **Full-Stack Observability Integration:**
            - Linked Resilience4j states to **Spring Boot Actuator** for real-time health monitoring.
            - Enhanced **Micrometer/Tempo** tracing to capture fallback events and latency spikes.
        - **Validation:**
            - Verified Rate Limiter effectiveness via high-concurrency load simulations.
            - Confirmed distributed lock integrity during simultaneous move requests.

---

## [0.12.0] - 2026-04-24

### 🏆 Phase 12: Quality Assurance & Code Integrity
> **Note:** This phase elevates the project's sustainability and reliability to the highest level. By integrating **SonarQube**, technical debt has been made visible, test coverage has been mechanized via **JaCoCo**, and the coverage of critical code paths has been expanded using **JUnit 5** and **Mockito**.

- **2026-04-24:**
    - **Quality Excellence: Boosted Coverage & Zero-Smell Refactoring (PR #37 | Issues #34, #35):**
        - **Coverage Breakthrough (#34):** Significantly increased test coverage from 58.1% to a robust **91.5%**, ensuring the integrity of critical domain logic such as `MoveValidator` and `MoveExecutor`.
        - **Refactoring & Test Compression:** Streamlined the test suite by reducing 500+ lines of redundant code to 187 concise, high-impact lines using **JUnit 5 @Nested** classes and **@ParameterizedTest**.
        - **Edge-Case Validation:** Implemented advanced test scenarios for complex FIDE rules, including En Passant, Castling constraints, and "Pinned Piece" logic to prevent illegal move exposures.
        - **Zero-Smell & Technical Debt Elimination (#35):** Successfully eliminated all 26 initial "Code Smells" and 4.5 hours of technical debt, achieving a **0-issue baseline** and **0.0% duplication** through SonarQube-guided refactoring.
        - **Documentation & Artifacts:**
            - Established a clear progression history by organizing snapshots into `initial` and `final` directories within `docs/assets/screenshots/01-infrastructure/sonarqube/`.
            - Archived proof of **222 successful test executions** and IDE-level SonarLint analysis results.
        - **Validation:**
            - **JUnit 5 & AssertJ:** Verified that all tests use fluent assertions for better readability and semantic accuracy.
            - **Quality Gate Completion:** Confirmed that the project officially meets the **"Passed"** status for all SonarQube Quality Gate metrics (Reliability: A, Security: A, Coverage: 91.5%).
- **2026-04-22:**
    - **SonarQube Static Analysis & Quality Gate Integration (PR #36 | Issue #33):**
        - **Static Analysis Infrastructure:** Successfully integrated SonarQube into the project root. Initiated automated tracking for "Code Smells," "Vulnerabilities," and "Technical Debt."
        - **Quality Gate Baseline:** Identified and documented 26 "Code Smells" and 4.5 hours of technical debt in the initial analysis. Established a baseline security score to improve "Security Hotspots" from grade "E."
        - **JaCoCo Test Coverage Reporting:** Configured JaCoCo as the primary test reporting engine. Measured the current test coverage at **58.1%**, setting a target for increase in issue `#34`.
        - **Professional Engineering Standards:** Enforced automated control mechanisms for "Clean Code" and "SOLID" principles. Solidified "Software Engineer" standards across the codebase.
        - **Technical Artifacts & Documentation:**
            - Archived high-fidelity snapshots of the SonarQube dashboard, coverage lists, and security hotspots in `docs/assets/screenshots/01-infrastructure/sonarqube-initial/`.
            - Verified and documented the database schema via DBeaver and ensured container health via Docker Desktop logs.
        - **Validation:**
            - **Metrics Accuracy:** Confirmed the integrity of all code metrics (LoC, Complexity, Duplications) via the `02-initial-metrics-summary.png` report.
            - **Infrastructure Stability:** Verified that all 11 infrastructure containers (App, DB, Redis, LGTM Stack, SonarQube) are operational and correctly orchestrated.

---

## [0.11.0] - 2026-04-21

### 📊 Phase 11: Full-Stack Observability & Monitoring
> **Note:** This phase introduces real-time visibility into the system's internal state. By implementing the LGTM (Loki, Grafana, Tempo, Prometheus) stack, the project gains the ability to track business metrics, technical performance, and distributed logs through a centralized dashboard.

- **2026-04-21:**
    - **Loki-Tempo Correlation & Distributed Tracing Verification (PR #32 | Issue #28):**
        - **Log-to-Trace Correlation:** Established a seamless transition between Grafana Loki logs and Tempo traces using "Derived Fields." Users can now click a `traceId` in a log entry to instantly visualize the corresponding trace span.
        - **Data Integrity & Filtering:** Optimized Loki queries to filter out null trace IDs (`{container="chess-server"} |~ "chess-backend,[a-zA-Z0-9]+"`), ensuring only actionable, high-value logs are analyzed.
        - **Trace Analysis & Performance Profiling:** Successfully analyzed `/api/lobby/join` request lifecycles. Verified that a typical join operation takes ~41ms, with 26ms spent on security filter chains.
        - **Technical Artifacts:** - Exported high-fidelity trace data as `trace-performance-sample.json` for performance benchmarking.
            - Documented the full-stack observability view (split-screen Logs/Traces) to demonstrate end-to-end system transparency.
        - **Validation:** Confirmed 100% ID matching between application logs and OpenTelemetry spans under real game traffic.
    - **Grafana Dashboard Configuration & Export (PR #31 | Issue #27):**
        - **Custom Business Dashboards:** Created dedicated Grafana dashboards for real-time business insights:
            - `chess-active-games-dashboard.json`: Monitors concurrent active sessions.
            - `chess-total-moves-dashboard.json`: Tracks cumulative move executions using Prometheus counters.
        - **Observability Artifacts:** Exported dashboard configurations as version-controlled JSON files to `docs/assets/dashboards/` for environment portability.
        - **Engineering Documentation:** Captured high-fidelity snapshots of JVM health (Memory, GC, Threads) and business metrics to provide visual proof of system stability.
        - **Validation:** Verified the end-to-end metric pipeline from Spring Boot Micrometer to Grafana visualization under live game conditions.
    - **Infrastructure Orchestration & LGTM Stack Integration (PR #30 | Issue #26):**
        - **Full-Stack Monitoring Orchestration:** Developed a comprehensive `docker-compose` orchestration for the LGTM stack, integrating **Prometheus** (Metrics), **Loki** (Logging), **Tempo** (Tracing), and **Grafana** (Visualization).
        - **Distributed Tracing with Grafana Tempo:** - Configured **OpenTelemetry (OTLP)** in the Spring Boot backend to export traces to Tempo.
            - Implemented a modern `tempo.yml` configuration using the new scoped overrides format (v2.10.4 compatibility).
            - Enabled high-precision performance tracking for game move execution and WebSocket event propagation.
        - **Centralized Logging with Grafana Loki:** Established a unified logging pipeline, allowing real-time correlation between application logs and distributed traces within the Grafana UI.
        - **Observability Configuration (Application-Level):** - Updated `application.yaml` with dedicated profiles for tracing sampling and OTLP endpoints.
            - Refined logging patterns to include `traceId` and `spanId` for improved request tracking.
        - **Validation:** - **Service Health:** Verified all 11 infrastructure containers are operational and healthy.
            - **Data Source Integrity:** Confirmed successful connection and data flow between Grafana and the underlying data stores (Prometheus, Loki, Tempo).
            - **Tracing Verification:** Successfully visualized the lifecycle of a Move Execution request within Tempo, identifying latency bottlenecks.
- **2026-04-20:**
    - **Metrics Instrumentation & Actuator Integration (PR #29 | Issue #25):**
        - **Spring Boot Actuator Setup:** Integrated Micrometer and Actuator to expose critical system health and performance data via the `/actuator/prometheus` endpoint.
        - **Custom Chess Metrics:** Developed and registered domain-specific metrics using `MeterRegistry`:
            - `chess.games.active`: A **Gauge** tracking the real-time count of concurrent game sessions.
            - `chess.moves.total`: A **Counter** measuring the cumulative volume of move executions across the platform.
        - **Security Gateway Configuration:** Updated `SecurityConfig` to permit unauthorized access to monitoring endpoints specifically for Prometheus scraping, while maintaining strict JWT-based security for business APIs.
        - **Observability Refactoring:** Enhanced `GameService` to increment/decrement metrics atomically during game lifecycle events (creation, move execution, termination) without impacting core logic performance.
        - **Validation:**
            - **Local Scrape Verification:** Confirmed successful metric exposure and formatting in the Prometheus-compatible text format.
            - **Metric Accuracy:** Verified that `chess.games.active` accurately reflects the state of the internal `ConcurrentHashMap`.

---

## [0.10.0] - 2026-04-20

### 🐳 Phase 10: Infrastructure, Containerization & DB Versioning
> **Note:** This phase transitions the project from a local development setup to a production-ready, containerized ecosystem. It introduces professional database schema management and service orchestration to ensure "Zero-Configuration" deployments.

- **2026-04-20:**
    - **Infrastructure & Engineering Hardening (PR #24):**
        - **Full Containerization (Docker):** Developed a multi-stage `Dockerfile` for both Backend (JRE 21) and Frontend (Nginx/Vite). Orchestrated the entire stack (Java, React, PostgreSQL, Redis) using `docker-compose`.
        - **Database Migration Engine (Liquibase):** Integrated **Liquibase** for version-controlled database schema management. Replaced Hibernate's `ddl-auto: update` with professional SQL-based migrations, ensuring schema consistency across all environments.
        - **Enterprise Configuration Management:** Optimized `application.yaml` to utilize environment variables for sensitive data, enabling seamless transitions between Development, Docker, and Production profiles.
        - **Service Health & Resilience:** Implemented `healthcheck` protocols in Docker Compose to ensure the Backend only initializes after PostgreSQL and Redis are fully operational, preventing connection-refused failures.
        - **Strategic Engineering Roadmap:** Authored a comprehensive **Engineering & Infrastructure Analysis Report**, defining the path for Full-Stack Observability (LGTM Stack) and Distributed System Reliability (Resilience4j).
        - **Validation:**
            - **Migration Integrity:** Verified successful schema generation and execution via Liquibase changelog locks.
            - **Orchestration Stability:** Confirmed stable inter-service communication within the Docker network (Backend-to-DB and Backend-to-Redis connectivity).

---

## [0.9.0] - 2026-04-17

### 🤝 Phase 9: Remote Multiplayer & Global Matchmaking
> **Note:** This phase marks the project's evolution from a local engine to a distributed gaming platform. It enables real-time synchronization between disparate clients using a stateful WebSocket architecture and global session orchestration.

- **2026-04-17:**
    - **Mechanics Refinement & Bug Fixes (PR #23):**
    - **FIDE Rule Compliance:** Fixed critical edge cases in **En Passant** and **Castling** logic to ensure 100% rule accuracy during remote sessions.
    - **Concurrency Management:** Integrated `ConcurrentHashMap` and thread-safe locks within the `Game` model to prevent race conditions during simultaneous move attempts or resignation events.
    - **Cross-Client UX:** Enhanced the React frontend to handle "Waiting for Opponent" states and integrated real-time visual feedback when the remote player performs an action.
    - **Global Multiplayer Implementation (PR #22):**
        - **Distributed Session Orchestration:** Finalized the `GameSessionService` to manage real-time player pairing, allowing users to join matches from different local instances via a unique `gameId`.
        - **Synchronized State Propagation:** Refactored the WebSocket event pipeline to ensure that move executions, turn transitions, and game-status updates are broadcasted atomically to both clients.
        - **STOMP Destination Security:** Implemented dynamic subscription guards to ensure players can only listen to and send moves within their authorized game sessions.
        - **Handshake & Reconnection Logic:** Developed a robust WebSocket handshake mechanism that recovers game state for clients during brief network interruptions or browser refreshes.
    - **Validation:**
        - **Cross-Session Verification:** Successfully verified real-time synchronization by conducting manual playtests across multiple browser instances.
        - **Latency Consistency:** Observed stable move delivery and event broadcasting across local network sessions without noticeable synchronization drift.
---

## [0.8.0] - 2026-04-09

### 🛡️ Phase 8: Server-Side Authority & Engineering Hardening
> **Note:** This phase establishes the Backend as the "Single Source of Truth." It eliminates client-side trust, enforcing strict server-side validation for every game action and ensuring architectural integrity through modern Java features.

- **2026-04-09:**
    - **Implementation of Server-Authoritative Logic (PR #21):**
        - **Engine Centralization:** Migrated move validation from the React frontend to the Spring Boot core. The backend now performs exhaustive FIDE checks before updating the PostgreSQL state.
        - **Advanced Piece Modeling:** Refactored the `Piece` hierarchy using **Java 17 Sealed Classes** and **Pattern Matching**, ensuring compile-time safety for move calculations across different piece types.
        - **Domain Persistence:** Integrated **Java Records** for immutable state snapshots (`MoveRecord`, `GameStateRecord`), preventing accidental side effects during game simulations.
        - **Anti-Cheat Infrastructure:** Developed a server-side "Clock-Sync" mechanism to prevent client-side timer manipulation during high-stakes matches.
        - **ELO & Stats Engine:** Developed the initial `StatisticsService` to persist ELO ratings and match history against the **Training Bot** after game termination.
        - **Performance Optimization:** Implemented a **Simulation & Rollback** pattern for "Check" detection, reducing object allocation overhead during heavy move-tree scans.
        - **Validation:** Conducted a stress-test suite using JUnit 5, simulating 10,000+ random move sequences to verify state consistency and memory leak prevention.

---

## [0.7.0] - 2026-04-01

### 🔐 Phase 7: Identity Management & Authentication Security
> **Note:** This phase marks the transition from an anonymous platform to a User-Centric ecosystem. It hardens backend data security while establishing a professional "Identity Gateway" on the React frontend.

- **2026-04-01:**
    - **Integrated Authentication Suite (PR #20):**
        - **Backend Security Hardening:** Implemented secure registration workflows with password hashing and robust credential validation. Tightened access controls for all Auth endpoints.
        - **Frontend Identity Gateway:** Developed the `AuthCard` component, a high-fidelity interface for Login and Registration featuring React 19 state-driven form management.
        - **API Validation:** Integrated server-side validation for `UserRequest` DTOs, ensuring data integrity (email formats, password complexity).
        - **UX & Identity Switching:** Enabled fluid transitions between auth views and integrated a "Guest Login" bypass for immediate play access.
        - **Theme Synchronization:** Fully integrated the Auth UI with the global Dark/Light mode engine for a seamless visual experience.
        - **Verification:** Successfully conducted end-to-end (E2E) testing via Postman, covering all login, registration, and error-handling scenarios with a 100% pass rate.

---

## [0.6.0] - 2026-03-26

### ♟️ Phase 6: Special Moves & Stability Refinement
> **Note:** This phase completes the implementation of FIDE special rules and harmonizes the communication between the React frontend and Spring Boot backend for complex move sequences.

- **2026-03-26:**
    - **UI/UX Transformation & Theme Engine (PR #19):**
        - **Dynamic Theming:** Implemented a multi-theme engine supporting `Classic`, `Modern`, and `Emerald` board styles with synchronized coordinate colors.
        - **Dark/Light Mode:** Integrated a global theme toggle using Tailwind CSS and CSS variables for seamless dark/light mode transitions.
        - **Game-Over & Timeout Modals:** Developed high-fidelity overlay modals for `CHECKMATE` and `TIMEOUT` states, including navigation actions (New Game, Main Menu).
        - **Advanced Timing System:** Implemented dual-player countdown timers with visual urgency indicators (red-pulse animation below 30s) and frontend-side termination logic.
        - **Enhanced Sidebars:** Refactored the "Captured Pieces" and "Advantage Tracker" panels for better space efficiency and visual clarity using SVG filtering.
- **2026-03-25:**
    - **Live Operations Engine (UX) (PR #18):**
        - **Event Synchronization:** Optimized the `useEffect` hook in `ChessBoard.tsx` to accurately distinguish between system messages (Game Started, Errors) and player moves.
        - **Color Attribution Persistence:** Resolved a bug where White's promotion logs were incorrectly attributed or missing markers. The system now correctly identifies the move owner by tracking the `currentTurn` state offset.
        - **Real-time Formatting:** Enhanced log readability with high-precision timestamps, dynamic turn badges (White/Black), and animated entry transitions.
    - **Visual Polish & Asset Management:**
        - **Asset Standardization:** Refactored the asset pipeline to transition from external Wikipedia SVG dependencies to local hosting; established a semantic naming convention (e.g., `initial-state`, `promotion-modal`).
        - **Status Feedback:** Integrated dynamic visual alerts for "CHECK" and "CHECKMATE" within the Live Operations panel, including pulse animations for critical game states.
    - **Code Quality & Performance:**
        - **Side-Effect Optimization:** Refined `useEffect` dependencies to prevent redundant re-renders and duplicate logging of WebSocket messages using `useRef` for message tracking.
        - **Conditional Rendering Logic:** Hardened the Promotion Modal triggers to ensure activation occurs strictly during legal pawn-to-8th-rank transitions.
- **2026-03-24:**
    - **Advanced Rule Completion (PR #17):**
        - **Interactive Pawn Promotion:** Integrated a seamless promotion workflow between Frontend and Backend. Added support for selecting PieceType (Queen, Rook, Bishop, Knight) via a UI modal and ensuring the backend processes the `promotionType` correctly.
        - **Castling Synchronization:** Finalized King-side and Queen-side castling logic, ensuring both the King and Rook are updated atomically on the board and the UI reflects the dual-piece move.
    - **Bug Fixes & UX Improvements:**
        - **Visual Synchronization:** Resolved a critical bug where piece colors were inverted in the UI due to Case-Sensitivity in the board representation string. Standardized **Uppercase for White** and **Lowercase for Black**.
        - **Grid Alignment:** Fixed a UI layout issue where empty squares caused row/column shifts. Stabilized the 8x8 grid using `aspect-square` and fixed-size CSS grid templates.
    - **Code Refactoring:**
        - **DTO Alignment:** Updated `MoveRequest` to support optional promotion fields, ensuring compatibility with standard movement requests.
        - **Board Serialization:** Optimized the `Board.toString()` method for reliable state broadcasting over WebSockets.

---

## [0.5.0] - 2026-03-23

### 🎨 Phase 5: UI Integration & Local Play Readiness
> **Note:** This phase focuses on the transition from a pure backend engine to a playable local interface. It includes significant refactoring for better OOP adherence and the initial React-based board synchronization.

- **2026-03-23:**
    - **Domain Refactoring & Engine Optimization (PR #16):**
        - **Polymorphic Validation:** Refactored `Game.java` to delegate movement logic entirely to individual `Piece` subclasses, eliminating redundant switch-case blocks and improving extensibility.
        - **Enhanced Attack Detection:** Streamlined `isSquareAttacked` logic to leverage the unified `isValidMove` interface, enhancing engine performance and rule consistency.
        - **Robust State Management:** Refined `handleCastlingRookMove` and `simulateAndCheckSafety` to ensure atomic board updates and reliable state rollback during move simulations.
    - **Frontend Architecture (Initial):**
        - **React 19 & Tailwind Setup:** Initialized the frontend component structure, including the main `App.tsx` and global styles.
        - **Board State Hooks:** Developed custom hooks for board state management and move handling in preparation for the visual board.
    - **Documentation & Governance:**
        - **README Overhaul:** Updated the main documentation to reflect the current focus on "Hot-seat" local play and high-level engineering highlights.
        - 
---

## [0.4.0] - 2026-03-19

### 🌐 Phase 4: Multiplayer Infrastructure & Real-Time Communication
> **Note:** This phase establishes the bridge between the core domain and the outside world. It introduces a hybrid communication model using REST for orchestration and WebSockets (STOMP) for low-latency gameplay.

- **2026-03-19:**
    - **Full Infrastructure Implementation (PR #15):**
        - **WebSocket & STOMP Engine:** Configured `WebSocketConfig` with STOMP protocol and established a `/topic/game/{gameId}` broadcast system.
        - **API Layer:** Developed `GameRestController` for session creation and `GameWebSocketController` for real-time move processing.
        - **Security:** Implemented `SecurityConfig` to facilitate development-phase testing by permitting `/api/**` and `/ws-chess/**` endpoints.
        - **Session Management:** Built `GameService` to handle multi-game concurrency using `ConcurrentHashMap`.
        - **Validation:** Successfully verified end-to-end flow via Postman (REST + WS Handshake) and documented technical assets in `docs/assets`.

---

## [0.3.0] - 2026-03-18

### ⚖️ Phase 3: Advanced Game Rules & Rule Engine Implementation
> **Note:** This phase marks the transition from a simple movement engine to a fully compliant chess adjudicator. It covers FIDE special moves, King safety simulations, and all game-ending conditions.

- **2026-03-18:**
    - **Draw Rule Implementation (PR #14):**
        - **Threefold Repetition:** Implemented `boardHistory` tracking to detect identical board states (Position + Turn).
        - **50-Move Rule:** Integrated a `halfMoveClock` to trigger a draw after 100 consecutive half-moves without a capture or pawn advance.
    - **Final Adjudication:** Refactored `updateGameStatus` to include automated `DRAW` detection alongside win/loss states.
    - **En Passant Logic (PR #13):**
        - **Temporal Capture:** Implemented the "En Passant" rule, allowing pawns to capture opponents that have just performed a double-step move.
        - **Validation:** Added checks to ensure the capture is performed immediately following the double-step.
- **2026-03-17:**
    - **Castling & Path Safety (PR #12):**
        - **King/Rook Coordination:** Developed King-side and Queen-side castling.
        - **Safety Constraints:** Implemented path validation to prevent castling through or into check.
    - **Pawn Promotion (PR #11):**
        - **Transformation:** Added automatic Queen promotion when a pawn reaches the opposite end of the board.
- **2026-03-16:**
    - **Checkmate & Move Safety (PR #10):**
        - **Simulation Engine:** Developed `simulateAndCheckSafety` using a `try-finally` rollback to verify that no move leaves the King in check.
        - **End-Game Detection:** Implemented `isCheckmate` and `isStalemate` by scanning all possible legal moves under pressure.

---

## [0.2.0] - 2026-03-16

### ♟️ Phase 2: Core Domain Modeling & Piece Logic
> **Note:** This release marks the completion of all 6 individual piece movement rules, board initialization, and the central game orchestrator.

- **2026-03-16:**
    - **Game Orchestration (PR #9):** Implemented [**Game.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Game.java) to act as the central domain orchestrator for turn management, move execution, and game lifecycle.
    - **Game Status Logic:** Introduced [**GameStatus.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/GameStatus.java) to track session states (Active, Resigned, etc.) and integrated a `resign` mechanism.
    - **Unit Validation:** Developed [**GameTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/GameTest.java) to validate turn-switching, out-of-turn move prevention, and state-based restrictions.
    - **Phase Milestone:** Formally completed **Phase 2: Domain Modeling**, establishing a fully functional movement engine.
- **2026-03-15:**
    - **King Implementation (PR #7, #8):** Finalized [**King.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/King.java) logic and movement validation. This update resolves missing domain components and completes the initial piece hierarchy.
    - **Unit Validation:** Implemented [**KingTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/KingTest.java) to ensure 100% coverage for King-specific movement constraints.
- **2026-03-14:**
    - **Queen Implementation (PR #6):** Implemented [**Queen.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Queen.java) by harmonizing linear and diagonal movement patterns.
    - **Unit Validation:** Added [**QueenTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/QueenTest.java) for comprehensive sliding movement verification.
- **2026-03-13:**
    - **Rook Implementation (PR #5):** Developed [**Rook.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Rook.java) with a directional scanning algorithm for horizontal/vertical moves.
    - **Unit Validation:** Verified scanning logic via [**RookTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/RookTest.java).
- **2026-03-12:**
    - **Bishop Implementation (PR #4):** Implemented diagonal validation in [**Bishop.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Bishop.java) using coordinate difference logic.
    - **Unit Validation:** Conducted diagonal move tests in [**BishopTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/BishopTest.java).
- **2026-03-11:**
    - **Knight Implementation (PR #3):** Created [**Knight.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Knight.java) using fixed-offset validation (L-shape).
    - **Unit Validation:** Validated jump ability and L-move constraints in [**KnightTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/KnightTest.java).
- **2026-03-10:**
    - **Pawn Implementation (PR #2):** Developed [**Pawn.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Pawn.java) with initial double-step and conditional capturing.
    - **Unit Validation:** Tested forward-only and diagonal capture scenarios in [**PawnTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/PawnTest.java).
- **2026-03-09:**
    - **Domain Foundations (PR #1):** Established the core 8x8 [**Board.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Board.java) infrastructure and the **Sealed** [**Piece.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Piece.java) hierarchy.
    - **Value Objects & Types:** Implemented immutable domain descriptors: [**Position.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Position.java), [**Color.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Color.java), and [**PieceType.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/PieceType.java).
    - **Unit Validation:** Implemented [**BoardTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/BoardTest.java) and [**PositionTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/PositionTest.java) to verify coordinate management, board state invariants, and object immutability.

---

## [0.1.0] - 2026-03-08
> **Note:** This milestone was retroactively configured to map to issue #47 to establish the project's foundational tracking and lifecycle governance.

### ✨ Initial Infrastructure & Monorepo Setup
- Initialized **Chess Backend** (Spring Boot 3.4.6) and **Chess Frontend** (React 19 + Vite).
- Developed core project governance: `SECURITY.md`, `LICENSE`, and `CONTRIBUTING.md`.
- Integrated [`.editorconfig`](../.editorconfig) and secure environment management via [`.env.example`](../.env.example).

### ⚙️ Strategic Planning & Engineering Standards
- **SDLC & Architecture:** Defined the **Domain-Driven Design (DDD)** and **Clean Architecture** roadmap.
- **Workflow Governance:** Established strict **Gitflow** and **Conventional Commits** (refer to [**Git Guide**](GIT_GUIDE.md)).
- **Quality Assurance:** Formulated a "Test-First" approach for domain-level logic.

---
*Standard: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)*
