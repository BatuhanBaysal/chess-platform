# 🏗️ Architectural Blueprint

This document outlines the unified architectural vision for the **Chess Platform**, covering both the Backend Engine (`chess-backend`) and the Frontend UI (`chess-frontend`).

---

## 🧩 Backend: Hexagonal Architecture (Ports & Adapters)
To ensure the core chess logic remains independent of frameworks, we follow the Hexagonal pattern inside `chess-backend`:

* **Domain Hexagon:** Contains pure Java 17+ logic. **Zero dependencies** on Spring or DB drivers.
* **Driving Adapters (Input):** REST Controllers and WebSocket (STOMP) handlers.
* **Driven Adapters (Output):**
    * **Relational Persistence:** PostgreSQL with Spring Data JPA and Liquibase migrations.
    * **Distributed Cache & Concurrency:** Redis with Redisson distributed locks.
    * **Identity & Access Management:** Keycloak OAuth2/OIDC Resource Server integration.
    * **Object Storage:** AWS SDK for Java v2 (S3 Client) adapter supporting local MinIO and Oracle Cloud (OCI) Object Storage.
    * **AI Sidecar:** Subprocess integration targeting the Stockfish engine via the UCI protocol.

### 🛡️ DDD & Modern Java Standards
* **Aggregate Roots:** The `Board` maintains all invariants.
* **Type Safety:** We use `sealed` classes for **Piece.java** hierarchy to enforce exhaustive pattern matching.
* **Immutability:** Extensive use of `records` for safe state snapshots.

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
