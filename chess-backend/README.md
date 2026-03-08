# ⚙️ Chess Backend (Spring Boot 3)

![Java 17](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring Boot 3.4.6](https://img.shields.io/badge/Spring_Boot-3.4.6-green?style=for-the-badge&logo=springboot&logoColor=white) ![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)

The core engine of the Chess Platform, designed with **Domain-Driven Design (DDD)** and **Clean Architecture** (Hexagonal) principles.

---

## 🏛️ Internal Architecture & Layers
This module follows a strict separation of concerns to keep the **Chess Logic** isolated from technical frameworks.

- **Domain Layer (The Core):** 🧠 The "Brain" of the project. Contains `Piece` hierarchies, `Move` validation, and `Board` state. **Pure Java, zero dependencies**, making it 100% testable and future-proof.
- **Application Layer (Services):** 🔄 Orchestrates use cases (e.g., "Start Game", "Make Move"). Handles transaction management and interfaces with the domain.
- **Api Layer (Drivers):** 🔌 REST Controllers for session management and **WebSocket (STOMP)** handlers for real-time game synchronization.
- **Infrastructure Layer (Adapters):** 💾 External concerns like **PostgreSQL** persistence (JPA), Security configurations, and Repository implementations.

---

## 🛠️ Key Technical Features
- **Modern Java 17 Features:** Utilizing **Sealed Classes** for piece types and **Records** for immutable position data.
- **Real-time Synchronization:** Low-latency, bidirectional communication via **STOMP over WebSockets**.
- **Data Integrity:** Strict validation via **JSR 380** and audit logging for every move.
- **API Documentation:** Fully documented interactive API using **Swagger UI (OpenAPI 3)**.
- **Testing Strategy:** 🛡️ TDD approach with **JUnit 5** and **Mockito**, focusing on 100% coverage of the Domain Rules.

---

## 📂 Package Structure (Planned)
```text
com.batuhan.chess
├── api             # Controllers, WebSocket Handlers & DTOs
├── application     # Use Cases & Application Services
├── domain          # Entities, Value Objects, Rules (Pure Java)
│   ├── model       # Board, Piece, Move
│   └── service     # Pure Domain Logic (Rule Engine)
├── infrastructure  # DB Config, Security & Repository Adapters
├── common          # Shared Constants & Thread-safe Utilities
└── exception       # Centralized @ControllerAdvice
```

## 🚦 Local Development
This project is built using **Amazon Corretto 17** and **Maven 3.x**. Follow these steps to set up the backend environment.

### 1. Prerequisites
- **JDK 17:** [Amazon Corretto 17](https://aws.amazon.com/corretto/) is recommended.
- **Database:** PostgreSQL for production-ready persistence.
- **Environment:** Create a `.env` file in the `chess-backend/` root directory.

### 2. Environment Setup
Create a `.env` file (see `.env.example`) with the following variables:
```text
CHESS_DB_URL=jdbc:postgresql://localhost:5432/chess_db
CHESS_DB_USERNAME=your_username
CHESS_DB_PASSWORD=your_password
```

### 3. Build & Run
Ensure you are in the `chess-backend/` directory before executing these commands:

```bash
# Clean previous builds and install dependencies
./mvnw clean install

# Run the Spring Boot application
./mvnw spring-boot:run
```

### 4. API Documentation & Interactive UI
Once the application is running, you can explore and test the endpoints via the integrated **OpenAPI 3.0** documentation:
- **Interactive Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Raw API Definition (JSON):** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

### 5. Running the Test Suite
This project follows a **TDD-ready** approach. To verify the integrity of the **Domain Rules** and **Service Layers** using the H2 in-memory database, execute:
```bash
./mvnw test
```

## 📂 Engineering Focus Areas
This backend is not just a game server; it is a technical showcase of high-standard software development practices.

* **Domain Purity:** The core chess engine is written in **Pure Java**, keeping the complex business rules (moves, checkmates, etc.) completely decoupled from the Spring Boot framework for maximum portability and testability.
* **Clean Code & SOLID:** Every class is designed with a **Single Responsibility**, ensuring the system remains maintainable as complex rules (like En Passant or Castling) are added.
* **High-Performance Logic:** Optimized board state representations and move-validation algorithms to ensure sub-millisecond response times for real-time play.
* **Thread Safety:** Carefully engineered to handle concurrent game sessions and asynchronous **WebSocket** synchronization without data races.
* **Hexagonal Architecture:** Adapters (Database, API) are kept at the periphery, protecting the "Inner Circle" (Domain) from external changes.

---

## ⭐ Support the Backend Development
If you're interested in the architectural decisions or the chess logic:
1.  **Check the Tests:** Explore `src/test/java` to see the TDD approach in action.
2.  **Read the Changelog:** Follow the daily commits to see how the Domain Layer evolves.
3.  **Star the Repo:** Stay updated as we move into Phase 3 (Rule Engine).

---
*Built with professional intent and a focus on Scalable Software Design.*
