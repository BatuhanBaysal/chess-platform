# 🏗️ Architectural Blueprint

This document outlines the unified architectural vision for the **Chess Platform**, covering both the Backend Engine (`chess-backend`) and the Frontend UI (`chess-frontend`).

---

## 🧩 Backend: Hexagonal Architecture (Ports & Adapters)
To ensure the core chess rules and business invariants remain independent of frameworks, databases, and third-party tools, `chess-backend` follows Hexagonal Architecture principles:

* **Domain Hexagon (Pure Java Core):** Contains framework-agnostic chess rules and models. **Zero external dependencies** on Spring Framework, persistence drivers, or messaging APIs.
* **Driving Adapters (Inbound / Input):**
    * **REST Controllers:** Spring WebMvc endpoints exposing APIs for room management, hints, and PGN export.
    * **WebSocket Handlers:** Real-time STOMP messaging over SockJS (`/ws-chess`) managing move execution, time synchronization, and player readiness.
* **Driven Adapters (Outbound / Output):**
    * **Relational Persistence:** PostgreSQL with Spring Data JPA and automated Liquibase migrations.
    * **Distributed Concurrency:** Redis with Redisson distributed locks (`lock:game:{gameId}`, `lock:lobby:{roomId}`).
    * **Event Broker:** RabbitMQ TopicExchange (`chess.game.exchange`) distributing asynchronous post-match analysis events.
    * **Identity & Access Management:** Keycloak OAuth2/OIDC Resource Server with asymmetric JWT token verification.
    * **Object Storage:** AWS SDK for Java v2 implementing `FileStoragePort`, interchangeably supporting Oracle Cloud (OCI) Object Storage and local MinIO.
    * **AI Opponent & Engine:** Cross-platform Stockfish binary execution via Java `ProcessBuilder` over the UCI protocol.

### 🛡️ DDD & Modern Java Standards
* **Aggregate Invariants:** The `Board` acts as the structural matrix, while `Game` orchestrates state, turn progression, and clocks.
* **Type Safety & Exhaustive Pattern Matching:** Uses Java 17 `sealed abstract class Piece permits Pawn, Knight, Bishop, Rook, Queen, King` to eliminate runtime type ambiguity.
* **Immutability:** Employs immutable Java `record` types (`Position`, DTOs) to guarantee thread safety and side-effect-free simulations.
* **Separation of Concerns:** Split into four dedicated domain collaborators:
    * `Board`: 8x8 matrix allocation and deep-copy state cloning (`Board.copy()`).
    * `MoveValidator`: Two-phase move validation (pseudo-legal path checks followed by virtual check safety simulation via `isMoveSafe`).
    * `MoveExecutor`: Board mutation, castling rook displacements, en passant captures, and promotion transformations.
    * `GameStateEvaluator`: Checkmate, Stalemate, Threefold Repetition, 50-move rule, and Insufficient Material evaluations.

---

## 🎨 Frontend: Feature-Based Modular Architecture
The frontend (`chess-frontend`) follows a **Modular, Feature-Sliced** approach to scale with the backend's complexity.

### 1. Feature-Based Directory Structure
Instead of grouping by file type, we group by business features and architectural domains:
* `src/features/chess/`: Real-time chess game engine components, hooks, evaluation bars, and move hint types.
* `src/features/auth/`: Keycloak OIDC authentication flow, token introspection, guest session lifecycles, and route guards.
* `src/features/menu/`: Navigation, interactive lobbies, active channel listeners, and landing views.
* `src/features/admin/`: Administrator control panels and system telemetry oversight.
* `src/features/user/`: User profiles, ELO progression stats, match distribution charts (Recharts), and avatar management.
* `src/constants/` & `src/routes/`: Global constants, board theme definitions (`CHESS_THEMES`), and protected routing wrappers.

### 2. Atomic Design & Component Purity
* **Atoms:** Low-level elements (Buttons, Square components, Chess Pieces).
* **Molecules:** Functional groupings (ChessBoard, MoveHistoryTable, ActiveChannelsPanel).
* **Organisms:** Complex UI sections (CommandCenter, GameHUD, Sidebar, ModalDialogs).

### 3. Type-Safe Domain Mirroring
To maintain the **Single Source of Truth (SSOT)**:
* **Domain Mirroring:** We mirror backend DTOs into TypeScript `interfaces` and validation schemas.
* **WebSocket Client:** Uses a custom service layer wrapping `@stomp/stompjs` and `sockjs-client`, ensuring incoming game states strictly adhere to domain models.

---

## 🔗 Unified Communication & Synchronization
The bridge between the Hexagon (Backend) and the Components (Frontend):

| Communication | Protocol | Purpose |
| :--- | :--- | :--- |
| **Identity & Access** | OAuth2 / OIDC | Token exchange, introspection, and role extraction via Keycloak. |
| **Request/Response** | REST API (JSON) | Profile management, game history, leaderboards, and S3 presigned avatar URLs. |
| **Real-time Engine** | WebSocket (STOMP) | Live move broadcasting, timer synchronization, opponent readiness, and telemetry. |
| **Data Validation** | JSR 380 / TS Schemas | Enforces payload integrity and contract validation across client and server boundaries. |

---

## 🧠 Single Source of Truth (SSOT) Philosophy
The backend is the **sole authority** for game state.
* The frontend treats UI state as *ephemeral* (temporary).
* Any move initiated by the user is treated as a "request" until the backend validates it, persists changes, and broadcasts the authoritative board state via WebSocket.

---
*Note: For infrastructure orchestration, monitoring stacks (Grafana/Prometheus/Loki/Tempo), and database migration details (Liquibase), refer to [INFRASTRUCTURE.md](./INFRASTRUCTURE.md).*
