# 🏛️ Deep Dive: Engineering Decisions & Architectural Patterns

This document outlines the core architectural decisions, concurrency controls, security layers, and frontend optimizations implemented in the Chess Platform. It details *why* specific technologies were chosen and *how* technical challenges were solved across the full stack.

---

## ♟️ 1. Backend Domain & Chess Engine Architecture

### Custom FIDE-Compliant Game Engine
* **Why:** Rather than relying on third-party APIs or off-the-shelf libraries for game rules, the core rules were built entirely in-house using Java. This provides absolute control over game logic, validation, and custom extensions.
* **Implementation:** Developed a modular engine (`GameValidator`, `MoveExecutor`) supporting complex FIDE rules including castling, en passant, pawn promotion, and threefold repetition checks.
* **Sealed Classes & Java Records:** Leveraged Java 17+ **sealed classes** and immutable **record structures** to construct a type-safe, fail-safe chess domain model and board matrix, ensuring zero unexpected state mutations.

### Simulation & Rollback Pattern (Check Detection)
* **The Challenge:** Validating King safety (check detection) risks corrupting the live game state during execution if illegal moves mutate the board.
* **The Solution:** Developed a cloning mechanism using immutable **Java Records** to simulate moves on a virtual board.
* **The Result:** **100% side-effect-free move validation**, combining thread-safe `Game` state management with board cloning simulations to evaluate check conditions safely.

### Server-Authoritative Timer & Synchronization
* **The Challenge:** Client-side timing is insecure, prone to drift, and susceptible to network latency or browser throttling.
* **The Solution:** Centralized timer orchestration in the **Backend (`GameService`)**, broadcasting heartbeats via WebSockets.
* **The Result:** **Absolute temporal consistency** across all clients, eliminating clock drift entirely.

---

## ⚡ 2. Concurrency, Distributed Locking & Data Integrity

### Redisson Distributed Locks
* **The Challenge:** Preventing race conditions in multi-node or multi-threaded backend environments during high-frequency, concurrent move events.
* **The Solution:** Enforced **Atomic State Broadcasting** by integrating a **Redisson-based distributed lock mechanism** optimized with connection pool configurations.
* **The Result:** Eliminated race conditions during multi-threaded real-time chess move processing, guaranteeing a strict **Single Source of Truth** for the game state.

### Database Optimization & Schema Migrations
* **Implementation:** Utilized Spring Data JPA with `@EntityGraph` and `@Cacheable` annotations to resolve N+1 query bottlenecks and cache frequent user queries.
* **Deterministic Evolution (Liquibase):** Replaced risky JPA auto-generation (`ddl-auto=update`) with declarative Liquibase migrations, guaranteeing schema parity across H2 tests, local PostgreSQL, and Oracle Cloud environments.

---

## 🔒 3. Security, IAM & Resiliency

### IAM Migration: From Hand-Rolled JWT to Keycloak OAuth2 / OIDC
* **The Evolution:** Authentication initially began as a custom, stateless JWT implementation using JJWT. However, maintaining custom token lifecycles, refresh flows, credential hashing, and role hierarchies added significant maintenance overhead.
* **The Solution:** Fully transitioned the security architecture to a production-grade **Keycloak (OAuth2/OIDC Resource Server)**.
    * The Spring Boot backend acts purely as an OAuth2 Resource Server validating asymmetric JWT signatures via Keycloak JWK Set URIs (`certs`).
    * Decoupled user registration, password policies, and admin privilege governance (`ADMIN` vs. `USER`) directly into Keycloak realms.
    * Handled ephemeral guest accounts natively with a 7-day expiration lifecycle.
* **Method-Level Authorization:** Sensitive administrative actions and game controls are guarded using `@PreAuthorize` annotations and **Resilience4j Rate Limiter**.

### Decoupled Hybrid Storage: AWS S3 SDK (MinIO & OCI)
* **The Challenge:** Serving user-uploaded avatar binaries directly through relational databases or local container filesystems leads to bloat, security risks, and poor horizontal scalability.
* **The Solution:** Implemented an abstract storage port using **AWS SDK for Java v2 (S3 Client)**.
    * **Local Environment:** Relies on a local **MinIO** container via the `storage-local` profile.
    * **Production Environment:** Points seamlessly to cloud-native **Oracle Cloud Infrastructure (OCI) Object Storage** through its S3-compatible API endpoint.
* **The Result:** Completely decoupled binary storage with zero code divergence between development and production.

### Centralized Exception Handling & Observability
* **Global Error Management:** Standardized UTC-based error payloads across REST and WebSocket layers via Spring `@RestControllerAdvice`.
* **LGTM Observability Stack:** OpenTelemetry and Micrometer trace propagations sent to **Tempo**, Prometheus metrics collected via Actuator, and structured JSON logs aggregated by Promtail into **Loki** and visualized in **Grafana**.

---

## 🤖 4. AI Engine & Asynchronous Processing

### Stockfish Integration via Sidecar Pattern
* **Implementation:** Integrated the industry-standard **Stockfish chess engine** using Java's `ProcessBuilder` and `CompletableFuture`.
* **Telemetry & Throttling:** Built asynchronous analysis pipelines, lobby management handlers, and automated watchdog timeout mechanisms. Evaluation telemetry broadcasting is throttled at `150ms` to protect WebSocket broker throughput under intensive engine calculations.

---

## 🎨 5. Frontend Architecture & Real-Time Synchronization

### Modular React 19 & Custom Hooks
* **Architecture:** Developed a modular React 19, TypeScript, and Tailwind CSS frontend featuring FIDE time controls, a dynamic theme engine (`CHESS_THEMES`), and robust `ErrorBoundary` layers.
* **State Optimization:** Utilized custom hooks (`useChess`, `useChessActions`, `useLobby`) with `requestAnimationFrame`, `useMemo`, and `useCallback` to prevent unnecessary board re-renders during high-speed move interactions.

### WebSocket Resilience & Session Recovery
* **Real-Time Layer:** Low-latency STOMP messaging over SockJS targeting local and Vercel edge deployments (`chess-platform-app.vercel.app`).
* **Session Recovery:** Engineered automated session recovery components (`useAuth`, `useChessSocket`, `ReconnectAlert`) with `gameId` handshakes, periodic heartbeat pings, and graceful disconnection handlers to preserve active games across transient network drops.
