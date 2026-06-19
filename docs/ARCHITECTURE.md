# 🏗️ Architectural Blueprint

This document outlines the unified architectural vision for the **Chess Platform**, covering both the Backend Engine and the Frontend UI.

---

## 🧩 Backend: Hexagonal Architecture (Ports & Adapters)
To ensure the core chess logic remains independent of frameworks, we follow the Hexagonal pattern:

* **Domain Hexagon:** Contains pure Java 17+ logic. **Zero dependencies** on Spring or DB drivers.
* **Driving Adapters (Input):** REST Controllers and WebSocket (STOMP) handlers.
* **Driven Adapters (Output):** PostgreSQL persistence (JPA) and Redis caching adapters.

### 🛡️ DDD & Modern Java Standards
* **Aggregate Roots:** The `Board` maintains all invariants.
* **Type Safety:** We use `sealed` classes for **Piece.java** hierarchy to enforce exhaustive pattern matching.
* **Immutability:** Extensive use of `records` for safe state snapshots.

---

## 🎨 Frontend: Feature-Based Modular Architecture
The frontend follows a **Modular, Feature-Sliced** approach to scale with the backend's complexity.

### 1. Feature-Sliced Architecture
Instead of grouping by file type, we group by **Business Features**:
* `features/game`: Handles board rendering, move animation, and move validation.
* `features/auth`: Manages JWT storage, login/register logic.
* `features/lobby`: Real-time room listing via WebSockets.

### 2. Atomic Design & Component Purity
* **Atoms:** Low-level elements (Buttons, Square components, Chess Pieces).
* **Molecules:** Functional groupings (ChessBoard, MoveHistoryTable).
* **Organisms:** Complex UI sections (GameHUD, Sidebar, ModalDialogs).

### 3. Type-Safe Domain Mirroring
To maintain the **Single Source of Truth (SSOT)**:
* **Domain Mirroring:** We mirror backend DTOs into TypeScript `interfaces` and `zod` schemas.
* **WebSocket Client:** Uses a custom service layer to wrap STOMP clients, ensuring incoming game states strictly adhere to our **domain models**.

---

## 🔗 Unified Communication & Observability
The bridge between the Hexagon (Backend) and the Components (Frontend):

| Communication | Protocol | Purpose |
| :--- | :--- | :--- |
| **Request/Response** | REST API | Authentication, User Profile, Game History. |
| **Real-time Engine** | WebSocket (STOMP) | Live moves, timer synchronization, opponent status. |
| **Data Validation** | JSON Schema / Zod | Ensures payload integrity on both ends of the wire. |

### 🔍 Observability Stack (LGTM)
* **Logging (Loki):** Centralized log management.
* **Metrics (Prometheus):** System performance and telemetry tracking.
* **Tracing (Tempo):** Distributed tracing for API and WebSocket lifecycle.
* **Visualization (Grafana):** Unified dashboard for system health.

---

## 🧠 Single Source of Truth (SSOT) Philosophy
The backend is the **sole authority** for game state.
* The frontend treats UI state as *ephemeral* (temporary).
* Any move initiated by the user is treated as a "request" until the backend broadcasts the *validated* new board state via WebSocket.

---
*Status: Architecture established. Backend follows Hexagonal/DDD (Java 17); Frontend follows Feature-Sliced/Type-Safe principles.*
