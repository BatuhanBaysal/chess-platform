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
- **Polymorphic Move Validation:** Leveraging OOP principles where each `Piece` subclass encapsulates its own movement rules, eliminating complex conditional logic in the core engine.
- **Simulative Move Safety:** Sophisticated check-detection mechanism using temporary state simulation with **atomic rollback** (`try-finally`) to ensure moves never leave the King vulnerable.
- **FIDE-Compliant Rule Engine:** Full implementation of **En Passant**, **Castling**, **Pawn Promotion**, and draw conditions (**50-move rule**, **Threefold Repetition**).
- **Modern Java 17 Features:** Extensive use of **Sealed Classes** for the piece hierarchy and **Records** for immutable DTOs and state snapshots.

---

## 📂 Package Structure (DDD Oriented)
```text
com.batuhan.chess
├── api                   # Entry points for the application
│   ├── config            # Security & WebSocket protocol configurations
│   ├── controller        # REST & WebSocket STOMP message handlers
│   └── dto               # Immutable Data Transfer Objects (Records)
├── application.service   # Orchestration logic (GameService)
├── domain.model          # Pure Java Core (The Chess Engine)
│   ├── Bishop, Rook...   # Polymorphic piece implementations
│   ├── Board, Game       # Aggregate roots and board state
│   └── Color, Position   # Domain Value Objects & Enums
└── ChessBackendApplication # Spring Boot Bootstrapper
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

* **Domain Purity:** Framework-agnostic "Pure Java" core for maximum testability. This architecture allows the chess engine to be ported or reused without any Spring Boot dependency.
* **Polymorphic Move Engine:** By moving validation logic into the `Piece` hierarchy, we've achieved a highly extensible design. Adding a new "Fairy Chess" piece is as simple as creating a new class, without touching the core `Game` logic.
* **Sealed Piece Hierarchy:** Leveraging Java 17 `sealed` types to provide compile-time safety. This ensures that only valid chess pieces exist in the system and allows for exhaustive pattern matching.
* **Hexagonal Alignment:** Clear boundaries between business rules (Domain) and technical implementations (Infrastructure). The `api` layer "drives" the domain, while the domain remains blissfully unaware of WebSockets or REST.
* **Record-Based Data Flow:** Using Java **Records** for DTOs and internal state snapshots to guarantee immutability and thread-safety across different system layers.

---
*Maintained with professional intent and a focus on Scalable Software Design.*
