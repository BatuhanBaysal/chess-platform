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

### Database Optimization & N+1 Query Resolution
* **Implementation:** Utilized Spring Data JPA with `@EntityGraph` and `@Cacheable` annotations to resolve N+1 query bottlenecks and cache frequent user queries.
* **JPA Modeling:** Designed scalable data access layers using `@ManyToOne`, lazy-loading strategies, and custom JPQL filtering queries (`AuditLogRepository`).

---

## 🔒 3. Enterprise Security & Resiliency

### Stateless Authentication, RBAC & Production CORS Origins
* **Implementation:** Built a secure authentication service using Spring Security 6, `AuthenticationManager`, and the `jjwt` library to deliver **stateless JWT-based authentication** alongside custom role hierarchies.
* **Method-Level Authorization:** Protected sensitive user actions against abuse via `@PreAuthorize` annotations and **Resilience4j Rate Limiter**.
* **DTO Validation & WebSocket Security:** Ensured secure user registration and data transfer using Java Bean Validation and advanced Regex constraints. Configured production-grade STOMP endpoint CORS patterns supporting both local development (`localhost`) and production Vercel environments (`https://chess-platform-app.vercel.app` and `https://chess-platform-*.vercel.app`).

### Centralized Exception Handling & Observability
* **Global Error Management:** Implemented a standardized, UTC-based global error handling infrastructure across both REST and WebSocket layers using Spring `@RestControllerAdvice`.
* **Observability:** Integrated Micrometer, OpenTelemetry, Prometheus, and structured SLF4J logging strategies to maximize system transparency, tracing, and operational health tracking.

---

## 🤖 4. AI Engine & Asynchronous Processing

### Stockfish Integration via Sidecar Pattern
* **Implementation:** Integrated the industry-standard **Stockfish chess engine** using Java's `ProcessBuilder` and `CompletableFuture`.
* **Telemetry & Watchdogs:** Built asynchronous analysis pipelines, lobby management handlers, and automated watchdog timeout mechanisms, using throttled state broadcasting (`150ms`) to protect WebSocket throughput under heavy data streams.

---

## 🎨 5. Frontend Architecture & Real-Time Synchronization

### Modular React & Custom Hooks
* **Architecture:** Developed a modular React, TypeScript, and Tailwind CSS frontend featuring FIDE time controls, a dynamic theme engine (`CHESS_THEMES`), and robust `ErrorBoundary` error management.
* **State Management:** Utilized custom hooks (`useChess`, `useChessActions`, `useLobby`) to handle real-board matrices, asynchronous API calls, and optimized state updates via `requestAnimationFrame`, `useMemo`, and `useCallback`.

### WebSocket Resilience, Production Routing & Session Recovery
* **Real-Time Layer:** Designed a low-latency, secure, and CORS-compliant WebSocket communication pipeline using STOMP protocols and SockJS targeting both local and Vercel production hosting environments.
* **Session Recovery:** Engineered automated session recovery components (`useAuth`, `useChessSocket`, `ReconnectAlert`) with `gameId` handshakes, periodic heartbeat pings, and graceful disconnection handlers to protect user sessions against transient network interruptions.
