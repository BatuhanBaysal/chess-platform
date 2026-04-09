# ⚙️ Chess Backend (Spring Boot 3)

![Java 17](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot 3.4.6](https://img.shields.io/badge/Spring_Boot-3.4.6-green?style=flat-square&logo=springboot&logoColor=white)
![JUnit 5](https://img.shields.io/badge/JUnit_5-C2185B?style=flat-square&logo=junit5&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

The core engine of the Chess Platform, designed with **Domain-Driven Design (DDD)** and **Clean Architecture (Hexagonal)** principles.

---

## 🏛️ Internal Architecture & Layers
This module follows a strict separation of concerns to keep the **Chess Logic** isolated from technical frameworks:

- **Domain Layer (The Core):** 🧠 A framework-agnostic **FIDE-compliant Chess Engine**. Handles move validation, King safety simulations, and complex game-ending conditions. **Pure Java, zero dependencies.**
- **Application Layer (Services):** 🔄 Orchestrates use cases like starting games and making moves. Handles transaction management and cross-cutting concerns.
- **API Layer (Drivers):** 🔌 REST Controllers and **WebSocket (STOMP)** handlers for real-time synchronization.
- **Infrastructure Layer (Adapters):** 💾 External concerns like **PostgreSQL** persistence (JPA) and Security configurations.

---

## 🚀 Getting Started & Setup
To maintain a single source of truth, all installation and environment setup instructions are located in the main development guide:

👉 [**Go to DEVELOPMENT.md for Setup Instructions**](../docs/DEVELOPMENT.md)

---

## 🛠️ Key Technical Features
- **Server-Side Authority (Single Source of Truth):** Complete migration of game logic to the backend. All move validations, timer synchronizations, and game state transitions are strictly enforced by the server to prevent client-side manipulation.
- **Polymorphic Move Validation:** Leveraging OOP principles where each `Piece` subclass encapsulates its own movement rules, eliminating complex conditional logic in the core engine.
- **Simulative Move Safety:** Sophisticated check-detection mechanism using temporary state simulation with **atomic rollback** (`try-finally`) to ensure moves never leave the King vulnerable.
- **Modern Java 17+ Standards:** Extensive use of **Sealed Classes** and **Pattern Matching** for the piece hierarchy, and **Records** for immutable DTOs and thread-safe state snapshots.

---

## 📂 Package Structure (DDD Oriented)
```text
com.batuhan.chess
├── api                         # Infrastructure Layer: External communication interfaces
│   ├── config                  # Protocol configurations (Security, WebSocket, CORS)
│   ├── controller              # Interface Adapters (REST Controllers & WebSocket Handlers)
│   ├── dto                     # Data Transfer Objects (Auth, Game, Error records)
│   └── exception               # Global API error handling and custom domain exceptions
├── application.service         # Application Layer: Use case orchestration
│   ├── auth                    # Identity and access management workflows
│   └── game                    # Game session coordination and match logic
├── domain                      # Domain Layer: Pure Java business logic (Heart of the engine)
│   ├── model                   # Core Domain Models
│   │   ├── chess               # Piece-specific logic (Sealed Classes), Board, and Game engine
│   │   ├── history             # Persistent match tracking and move archives
│   │   └── user                # User aggregate and identity domain models
│   └── repository              # Domain Repository interfaces (Contract for Persistence)
└── ChessBackendApplication     # Spring Boot entry point and auto-configuration
```

## 🧪 Testing Strategy
Our testing methodology focuses on **Domain Integrity**. Since the core logic is decoupled from the Spring framework, we achieve high-speed execution, reliable validation, and 100% predictable outcomes.

* **Logic Validation:** All move rules, piece behaviors, and board invariants are verified using **JUnit 5** and **Mockito**.
* **Atomic Simulation Testing:** Specialized tests for the `simulateAndCheckSafety` method, ensuring that the `try-finally` rollback mechanism correctly restores the board state even after complex move attempts.
* **Advanced Rule Coverage:** Comprehensive test suite for complex FIDE rules:
    * **Castling:** Validation of path safety and "not-in-check" requirements.
    * **En Passant:** Verification of the strict one-turn window for capturing.
    * **Promotion:** Ensuring pawns correctly transform into the chosen piece (defaulting to Queen) upon reaching the 8th rank.
* **Scenario-Based Testing:** The engine supports flexible board initialization via a `setPieceAt` API, allowing us to test complex end-game states (like "Philidor Position" or "Lucena Position") in complete isolation.

> 💡 For detailed instructions on how to run the test suite, please refer to the [**Setup & Development Guide**](../docs/DEVELOPMENT.md).

---

## 📂 Engineering Focus Areas
This backend serves as a technical showcase for modern software engineering standards and clean coding practices:

* **Domain Purity & Encapsulation:** A framework-agnostic "Pure Java" core. The engine's logic is isolated from Spring Boot, allowing for high-speed unit testing and ensuring that business rules remain decoupled from infrastructure.
* **Modern Java Patterns:** Leveraging **Sealed Classes** to define a closed hierarchy for chess pieces. This allows for exhaustive **Pattern Matching** in the move engine, providing compile-time safety and eliminating the need for brittle `instanceof` checks.
* **Immutability & Thread Safety:** Using **Java Records** for internal state snapshots (`MoveRecord`, `PositionRecord`). This ensures that the game state remains predictable and side-effect-free, especially during complex move simulations.
* **Hexagonal Alignment:** Strict boundaries where the `api` layer "drives" the domain, and the `infrastructure` layer handles persistence through `domain` interfaces, keeping the core "Hexagon" unaware of technical details like PostgreSQL or WebSockets.
* **Security & Authority:** Implementation of **JWT-based authentication** and server-side move enforcement, transforming the project from a visual tool into a secure, enterprise-grade chess platform.

---
*Maintained with professional intent and a focus on Scalable Software Design.*
