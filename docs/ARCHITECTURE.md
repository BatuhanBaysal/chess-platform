# 🏗️ Architectural Blueprint

This document outlines the unified architectural vision for the **Chess Platform**, covering both the Backend Engine (`chess-backend`) and the Frontend UI (`chess-frontend`).

---

## 🧩 Backend: Hexagonal Architecture (Ports & Adapters)
To ensure the core chess logic remains independent of frameworks, we follow the Hexagonal pattern inside `chess-backend`:

* **Domain Hexagon:** Contains pure Java 17+ logic. **Zero dependencies** on Spring or DB drivers.
* **Driving Adapters (Input):** REST Controllers and WebSocket (STOMP) handlers.
* **Driven Adapters (Output):** PostgreSQL persistence (JPA) and Redis caching adapters.

### 🛡️ DDD & Modern Java Standards
* **Aggregate Roots:** The `Board` maintains all invariants.
* **Type Safety:** We use `sealed` classes for **Piece.java** hierarchy to enforce exhaustive pattern matching.
* **Immutability:** Extensive use of `records` for safe state snapshots.

---

## 🎨 Frontend: Feature-Based Modular Architecture
The frontend (`chess-frontend`) follows a **Modular, Feature-Sliced** approach to scale with the backend's complexity.

### 1. Feature-Based Directory Structure
Instead of grouping by file type, we group by business features and architectural domains:
* `src/features/chess/`: Real-time chess game engine components, hooks, and types.
* `src/features/auth/`: Manages JWT storage, login/register logic.
* `src/features/menu/`: Navigation, dashboards, landing pages, and views.
* `src/features/admin/`: Administrator control panels and management features.
* `src/features/user/`: User profile and settings management features.
* `src/constants/` & `src/routes/`: Global constants, themes, and route protection wrappers.

### 2. Atomic Design & Component Purity
* **Atoms:** Low-level elements (Buttons, Square components, Chess Pieces).
* **Molecules:** Functional groupings (ChessBoard, MoveHistoryTable).
* **Organisms:** Complex UI sections (GameHUD, Sidebar, ModalDialogs).

### 3. Type-Safe Domain Mirroring
To maintain the **Single Source of Truth (SSOT)**:
* **Domain Mirroring:** We mirror backend DTOs into TypeScript `interfaces` and `zod` schemas.
* **WebSocket Client:** Uses a custom service layer to wrap STOMP clients, ensuring incoming game states strictly adhere to our domain models.

---

## 🔗 Unified Communication & Synchronization
The bridge between the Hexagon (Backend) and the Components (Frontend):

| Communication | Protocol | Purpose |
| :--- | :--- | :--- |
| **Request/Response** | REST API | Authentication, User Profile, Game History. |
| **Real-time Engine** | WebSocket (STOMP) | Live moves, timer synchronization, opponent status. |
| **Data Validation** | JSON Schema / Zod | Ensures payload integrity on both ends of the wire. |

---

## 🧠 Single Source of Truth (SSOT) Philosophy
The backend is the **sole authority** for game state.
* The frontend treats UI state as *ephemeral* (temporary).
* Any move initiated by the user is treated as a "request" until the backend broadcasts the *validated* new board state via WebSocket.

---
*Note: For infrastructure orchestration, monitoring stacks (Grafana/Prometheus/Loki/Tempo), and database migration details (Liquibase), please refer to [INFRASTRUCTURE.md](./INFRASTRUCTURE.md).*
