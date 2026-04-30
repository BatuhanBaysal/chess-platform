# 📜 Changelog

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
