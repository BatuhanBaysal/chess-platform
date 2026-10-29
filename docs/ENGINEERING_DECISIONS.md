# 🏛️ Deep Dive: Engineering Decisions & Architectural Patterns

This document outlines the core architectural decisions, concurrency controls, security layers, and asynchronous event pipelines implemented in the Chess Platform. It details *why* specific technologies were chosen and *how* technical challenges were solved across the full stack.

---

## 📜 Architectural Decision Records (ADR)

### ADR-001: Stateless Keycloak JWT Authentication & Real-Time Session Eviction
* **Context:** When an administrator deletes or deactivates a user account, active JWT tokens remain valid until expiration unless explicitly validated or blacklisted, introducing security risks.
* **Decision:** Retain stateless token issuance via Keycloak OIDC, but implement a global HTTP 401 `ACCOUNT_DEACTIVATED` listener inside the centralized Axios client interceptor. Upon receiving a 401 or deactivation flag, the client immediately evicts all authentication tokens from `localStorage` and `sessionStorage`, immediately redirecting the client to `/sign-up`.
* **Consequences:** Eliminates the overhead of maintaining distributed token blacklists in Redis for every request while guaranteeing immediate client eviction upon administrative actions.

### ADR-002: Liquibase Schema Evolution & Permanent Relational Cascading
* **Context:** Automatic ORM schema mutation (`ddl-auto=update`) creates schema drift, unpredictable production states, and risks unhandled foreign key orphaned records.
* **Decision:** Enforce Liquibase declarative changesets under `db/changelog/` as the single source of truth for PostgreSQL DDL. Hibernate runs strictly in `validate` mode in production. Relational mappings enforce database-level `ON DELETE CASCADE` across games, moves, and audit logs.
* **Consequences:** Deterministic database deployments across local Docker, CI pipelines, and Oracle Cloud (OCI). Eliminates orphan entity persistence while preserving complete historical audit trails.

### ADR-003: Keycloak Ephemeral Guest Accounts & Scheduled Session Purge
* **Context:** Unauthenticated visitors should be able to try the platform with a single click, but unbounded guest accounts bloat both Keycloak identity storage and relational tables.
* **Decision:** Dynamically provision ephemeral guest users in Keycloak via the Keycloak Admin REST Client with a dedicated `ROLE_GUEST` authority and a strict 7-day expiration lifespan. A scheduled background cleanup task purges expired guest records and their associated active session entities.
* **Consequences:** Frictionless user onboarding without mandatory registration, while maintaining automated database hygiene and deterministic storage limits.

---

## ♟️ 1. Backend Domain & Chess Engine Architecture

### Custom FIDE-Compliant Game Engine
* **Why:** Rather than relying on third-party APIs or external evaluation engines for basic rule enforcement, all core chess rules were written in pure Java. This guarantees zero runtime dependencies, full control over transaction boundaries, and customizable simulation primitives.
* **Implementation:** Decomposed the domain into specialized collaborators (`MoveValidator`, `MoveExecutor`, `GameStateEvaluator`) supporting complete FIDE rules: castling rights tracking, en passant geometry, dynamic pawn promotion, threefold repetition hashes, and the 50-move rule counter.
* **Sealed Classes & Records:** Leveraged Java 17 `sealed abstract class Piece permits Pawn, Knight...` and immutable `Position` records to construct a fail-safe domain model, eliminating illegal piece instantiations at compile time.

### Simulation-Based Move Safety (Virtual Board Cloning)
* **The Challenge:** Validating whether a candidate move places or leaves the King in check requires executing the move. Performing this mutation on the live board risks game state corruption if rollbacks fail or if concurrent threads access the board during simulation.
* **The Solution:** Implemented an isolated deep-copy simulation pattern (`Board.copy()`). The candidate move is applied to an ephemeral board clone where the King's safety is verified via `MoveValidator.isMoveSafe()`.
* **The Result:** **100% side-effect-free move validation**. Concurrent queries never risk dirty state mutations, guaranteeing that illegal moves are intercepted before touching the active game.

### Server-Authoritative Timing & Heartbeat Synchronization
* **The Challenge:** Client-side timers drift due to browser throttling, tab switching, and network latency, making client-reported times vulnerable to tampering.
* **The Solution:** Centralized clock management in `GameTimerService`. Millisecond-level countdowns are computed and synchronized on the server. A watchdog routine monitors player heartbeats, automatically forfeiting abandoned matches after 60 seconds of disconnect.
* **The Result:** The server remains the single source of truth for time, broadcasting synchronized clock updates to both players via STOMP WebSockets.

---

## ⚡ 2. Concurrency, Distributed Locking & Data Integrity

### Redisson Distributed Locks (Mutual Exclusion)
* **The Challenge:** High-frequency simultaneous requests (e.g., rapid double-clicks, both players dispatching moves near the same millisecond, or simultaneous room joins) cause race conditions in clustered or multi-threaded environments.
* **The Solution:** Enforced atomic execution using **Redisson-based distributed locks** (`lock:game:{gameId}` and `lock:lobby:{roomId}`).
* **The Result:** Critical state transitions are serialized at the cluster level. If a lock cannot be acquired within the designated timeout, requests fail gracefully with a structured `GameOperationException`, protecting active sessions from concurrent corruption.

### Database Optimization & Liquibase Versioning
* **JPA Optimization:** Eliminated N+1 query bottlenecks in match history retrieval by declaring `@EntityGraph(attributePaths = {"whitePlayer", "blackPlayer"})` on `GameRepository`. Frequently queried user profiles leverage Spring Cache backed by Redis.
* **Deterministic Evolution (Liquibase):** Replaced JPA auto-schema generation (`ddl-auto=update`) with declarative, version-controlled Liquibase changesets under `db/changelog/`. Hibernate runs in `validate` mode in production, ensuring strict schema parity across local environments and cloud deployments.

---

## 🔒 3. Security, IAM & Resiliency

### IAM Architecture: Keycloak OAuth2 / OIDC Resource Server
* **The Evolution:** Transitioned from a custom, hand-rolled JJWT implementation to an enterprise-grade **Keycloak OAuth2/OIDC Resource Server**.
* **The Implementation:**
    * Spring Security acts as a stateless Resource Server validating asymmetric JWT signatures via Keycloak JWK Set endpoints (`certs`).
    * Dedicated `KeycloakRoleConverter` maps JWT realm roles into Spring Security granted authorities.
    * Configured a hierarchical role structure: `ROLE_ADMIN > ROLE_USER > ROLE_GUEST`.
    * Ephemeral guest accounts are provisioned via Keycloak with a 7-day expiration lifecycle.
* **Method-Level Authorization & Rate Limiting:** Critical endpoints are secured with method-level authorization and Resilience4j rate limiting (`authRegisterLimiter`, `authLoginLimiter`, `gameCreationLimiter`, `accountActionLimiter`), returning standard `429 Too Many Requests` responses with `Retry-After: 60` headers on limit breaches.

### Hexagonal Storage Port: AWS SDK v2 (MinIO & OCI)
* **The Challenge:** Storing avatar binaries directly in PostgreSQL causes database bloat, while local filesystem storage breaks horizontal scalability.
* **The Solution:** Implemented an abstract domain port (`FileStoragePort`) backed by an outbound adapter (`S3StorageAdapter`) utilizing AWS SDK for Java v2.
    * **Local Development:** Routes to an S3-compatible local **MinIO** container.
    * **Production:** Seamlessly routes to **Oracle Cloud Infrastructure (OCI) Object Storage** using its S3-compatible API.
* **The Result:** Binary storage is decoupled from the application logic with zero code changes required between local testing and cloud deployment.

### AOP-Driven Audit Logging
* **Implementation:** Annotated administrative workflows with a custom `@AuditableAction` meta-annotation.
* **The Aspect:** `AuditLogAspect` transparently intercepts method executions, extracts administrator credentials from the `SecurityContextHolder`, and persists structured audit records without polluting service layer business logic.

---

## 🤖 4. AI Engine & Asynchronous Processing

### Sub-Process Stockfish Integration
* **Implementation:** Deployed the Stockfish chess engine as an isolated sub-process via Java `ProcessBuilder`, communicating asynchronously over standard I/O streams using the UCI protocol.
* **Self-Healing Lifecycle:** If the Stockfish process terminates unexpectedly, `StockfishService` detects the failure and automatically respawns the binary on the next request. Evaluation requests are throttled at 250ms to prevent CPU saturation.

### Asynchronous Match Analysis via RabbitMQ
* **The Challenge:** Calculating post-game depth-12 Stockfish evaluations and centipawn metrics is computationally intensive and should not block the main WebSocket thread responsible for finalizing matches.
* **The Solution:** Game completion dispatches a `GameAnalysisMessage` to RabbitMQ (`chess.game.exchange`). An asynchronous `GameEventConsumer` picks up the message and executes deep engine evaluations in worker threads.
* **Why RabbitMQ over Kafka:** The platform requires reliable point-to-point task queues with simple routing and delivery acknowledgements. RabbitMQ provides this without the infrastructure and partition management overhead of Kafka on a single-node cloud deployment.

---

## 🎨 5. Frontend Architecture & Real-Time Synchronization

### Modular React 19 & Custom Hooks
* **Architecture:** Developed a modular React 19, TypeScript, and Tailwind CSS frontend featuring FIDE time controls, a dynamic theme engine (`CHESS_THEMES`), and robust `ErrorBoundary` layers.
* **State Optimization:** Utilized custom hooks (`useChessGameLogic`, `useChessActions`, `useLobby`) with `requestAnimationFrame`, `useMemo`, and `useCallback` to prevent unnecessary board re-renders during high-speed move interactions.

### Hardware Web Audio API Sound Engine
* **Why:** External MP3/WAV audio assets introduce network loading latency, CDN dependency, and possible asset 404s during fast-paced blitz games.
* **The Solution:** Direct hardware sound synthesis using the browser's native `AudioContext` and `OscillatorNode` (`useChessAudio`). Waveforms and frequency sweeps (triangle, sine, sawtooth) generate move, capture, check, and game-over sound effects with 0 ms latency and zero asset downloads.

### WebSocket Resilience & Session Recovery
* **Real-Time Layer:** Low-latency STOMP messaging over SockJS targeting local and cloud deployments.
* **Session Recovery:** Engineered automated session recovery components with `gameId` handshakes, periodic heartbeat pings (10s intervals), and graceful disconnection handlers to preserve active games across transient network drops.
