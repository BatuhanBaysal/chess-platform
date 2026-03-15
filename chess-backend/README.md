# ⚙️ Chess Backend (Spring Boot 3)

![Java 17](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot 3.4.6](https://img.shields.io/badge/Spring_Boot-3.4.6-green?style=flat-square&logo=springboot&logoColor=white)
![JUnit 5](https://img.shields.io/badge/JUnit_5-C2185B?style=flat-square&logo=junit5&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

The core engine of the Chess Platform, designed with **Domain-Driven Design (DDD)** and **Clean Architecture (Hexagonal)** principles.

---

## 🏛️ Internal Architecture & Layers
This module follows a strict separation of concerns to keep the **Chess Logic** isolated from technical frameworks:

- **Domain Layer (The Core):** 🧠 The "Brain" of the project. Contains `Piece` hierarchies (standardized via **Java 17 Sealed Classes**), movement validation, and `Board` state. **Pure Java, zero dependencies**.
- **Application Layer (Services):** 🔄 Orchestrates use cases like starting games and making moves. Handles transaction management and cross-cutting concerns.
- **API Layer (Drivers):** 🔌 REST Controllers and **WebSocket (STOMP)** handlers for real-time synchronization.
- **Infrastructure Layer (Adapters):** 💾 External concerns like **PostgreSQL** persistence (JPA) and Security configurations.

---

## 🚀 Getting Started & Setup
To maintain a single source of truth, all installation and environment setup instructions are located in the main development guide:

👉 [**Go to DEVELOPMENT.md for Setup Instructions**](../docs/DEVELOPMENT.md)

---

## 🛠️ Key Technical Features
- **Modern Java 17 Features:** Utilizing **Sealed Classes** for piece types (ensuring exhaustive pattern matching) and **Records** for immutable state data.
- **Real-time Synchronization:** Low-latency, bidirectional communication via **STOMP over WebSockets**.
- **API Documentation:** Fully documented interactive API using **Swagger UI**.
    - URL (local): `http://localhost:8080/swagger-ui.html`

---

## 📂 Package Structure (DDD Oriented)
```text
com.batuhan.chess
├── api             # Controllers, WebSocket Handlers & DTOs
├── application     # Use Cases & Application Services
├── domain          # Pure Java Entities & Rule Engine
│   ├── model       # Board, Piece (Sealed), Move, Square
│   └── service     # Pure Domain Logic (Movement Rules)
├── infrastructure  # DB Persistence, Security & Repository Adapters
└── common          # Shared Constants, Utilities & Exception Handling
└── exception       # Centralized Error Handling
```

## 🧪 Testing Strategy
Our testing methodology focuses on **Domain Integrity**. Since the core logic is decoupled from the framework, we achieve high-speed execution and reliable validation.

* **Logic Validation:** All move rules, piece behaviors, and board invariants are verified using **JUnit 5** and **Mockito**.
* **Zero-Side-Effect Testing:** We utilize an **H2 In-memory database** for integration tests to ensure clean, isolated test environments without affecting the local PostgreSQL instance.
* **Scenario Testing:** The engine supports flexible board initialization, allowing us to test complex end-game states (Checkmate, Stalemate, Castling) in complete isolation.
* **Continuous Integration:** Tests are automatically executed via **GitHub Actions** on every push to ensure no regressions are introduced.

> 💡 For detailed instructions on how to run the test suite, please refer to the [**Setup & Development Guide**](../docs/DEVELOPMENT.md).

---

## 📂 Engineering Focus Areas
This backend serves as a technical showcase for modern software engineering standards:

* **Domain Purity:** Framework-agnostic "Pure Java" core for maximum testability and long-term maintainability.
* **Sealed Piece Hierarchy:** Leveraging Java 17 `sealed` types to provide compile-time safety and prevent illegal piece extensions.
* **Hexagonal Alignment:** Clear boundaries between business rules (Domain) and technical implementations (Infrastructure).
* **Record-Based Data Flow:** Using Java **Records** for DTOs to guarantee immutability across system layers.

---
*Maintained with professional intent and a focus on Scalable Software Design.*
