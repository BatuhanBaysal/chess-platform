# ♟️ Chess Platform - Backend

![Java 17](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot 3.4.6](https://img.shields.io/badge/Spring_Boot-3.4.6-green?style=flat-square&logo=springboot&logoColor=white)
![JUnit 5](https://img.shields.io/badge/JUnit_5-C2185B?style=flat-square&logo=junit5&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

The core engine of the Chess Platform, built with **Domain-Driven Design (DDD)**, **Hexagonal (Ports & Adapters) Architecture**, and enterprise-grade concurrency controls. It provides a high-concurrency, resilient environment for real-time chess gameplay.

---

## 📝 Project Overview
I developed this backend to create a "Single Source of Truth" (SSOT) that ensures game integrity and ACID compliance while providing a fast, real-time experience under heavy concurrent loads.

**What I actually built and my contributions:**
* **Chess Engine Core:** Designed a pure Java, framework-agnostic FIDE-compliant engine featuring sealed classes, deep-copy board simulations, and robust rule validations (castling, en passant, promotion).
* **Concurrency & Transaction Boundaries:** Enforced strict transaction boundaries, ACID compliance, and **Redisson distributed locks** to prevent race conditions during simultaneous lobby actions and move requests.
* **Real-Time Architecture:** Built a hybrid REST and WebSocket (STOMP/SockJS) architecture with throttled broadcasting and central `@MessageExceptionHandler` error management.
* **Resilience & Security:** Integrated Resilience4j (Rate Limiter), Spring Security 6 stateless JWT authentication with Role Hierarchy, and AOP-based centralized audit logging.

---

## 🏗️ Architecture & Philosophy
This backend follows a strict **Hexagonal Architecture** pattern to keep the **Chess Logic** isolated from technical frameworks.

* **Domain Layer (The Core):** 🧠 A framework-agnostic, **FIDE-compliant Chess Engine** utilizing Java 17+ sealed classes (`Piece`) and records (`Position`). It handles move validation, King safety simulations via atomic rollback, and rules like the 50-move rule and threefold repetition.
* **Application Layer (Services):** 🔄 Orchestrates use cases like game matching, lobby management, and move execution. It handles transaction boundaries (`@Transactional`), distributed locking (`RLock`), and caching strategies.
* **API Layer (Drivers):** 🔌 REST Controllers and **WebSocket (STOMP)** handlers enriched with Springdoc OpenAPI/Swagger documentation and global exception interceptors (`@RestControllerAdvice`).
* **Infrastructure Layer (Adapters):** 💾 External concerns like **PostgreSQL** persistence managed via Liquibase migrations, Spring Data JPA with `@EntityGraph`, and Redis/Redisson configuration.

---

## 🚀 Engineering Pillars
* **Server-Side Authority (SSOT):** Complete migration of game logic to the backend. All move validations, timer synchronizations (`GameTimerService`), and game state transitions are strictly enforced by the server.
* **Distributed Locking & Concurrency:** Integration of Redisson client with optimized connection pools to secure game rooms (`lock:game:{gameId}`) against race conditions during simultaneous user interactions.
* **Simulative Move Safety:** Sophisticated check-detection mechanism (`MoveValidator.isMoveSafe`) using temporary state simulation (`board.copy()`) to ensure moves never leave the King vulnerable.
* **Polymorphic Move Validation:** Leveraging OOP principles where each `Piece` subclass encapsulates its own pseudo-legal movement rules and path-clearing checks.
* **Modern Java 17+ Standards:** Extensive use of **Sealed Classes**, **Pattern Matching**, and immutable **Records** across DTOs and internal engine payloads to minimize garbage collector overhead.

---

## 🛠️ Technology Stack
The project leverages industry-standard libraries to provide a robust, resilient, and observable environment.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core** | Spring Boot 3.4.6, Java 17 | Modern and type-safe business logic. |
| **Mapping & Boilerplate** | MapStruct, Lombok | Efficient DTO mapping and reduction of boilerplate code. |
| **Configuration** | spring-dotenv | Environment variable injection and configuration isolation. |
| **Chess Engine** | Stockfish UCI (ProcessBuilder) | Asynchronous AI opponent integration and position evaluation. |
| **Database & Migration** | PostgreSQL, Liquibase | Schema versioning, migrations, and relational persistence. |
| **Security** | Spring Security 6, JJWT | Stateless JWT authentication, role hierarchies, and BCrypt encryption. |
| **Resilience & Fault Tolerance** | Resilience4j | Fault tolerance, circuit breakers, rate limiters, and micrometer integration. |
| **Distributed Systems** | Redisson (Redis) | Distributed locking and thread safety. |
| **Observability** | Micrometer, Prometheus, OpenTelemetry | System metrics, tracing, and health monitoring. |
| **Testing & Quality Assurance** | JUnit 5, H2, Mockito, JaCoCo, Sonar | Unit/integration testing, in-memory isolation, coverage reports, and static code analysis. |

---

## 🚀 Getting Started & Running the Application

### Prerequisites
* Java 17+
* Maven 3.9+
* PostgreSQL 15+
* Redis 7+
* Docker & Docker Compose

### Configuration
Create a `.env` file in the root directory using the template below. The application uses `spring-dotenv` to inject these variables.

> ⚠️ **Security Warning:** Never commit your actual `.env` file to version control. Use `.env.example` as a template for team members.

```env
CHESS_DB_URL=jdbc:postgresql://localhost:5432/chess_db
CHESS_DB_USERNAME=postgres
CHESS_DB_PASSWORD=your_password
CHESS_JWT_SECRET=your_jwt_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Running Locally (Maven)
You can run the application directly using the local profile:
```bash
# Build the project, run test suites, and generate JaCoCo coverage reports
./mvnw clean install

# Run with local profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Running with Docker Compose
We utilize a multi-stage Docker build (maven:3.9-eclipse-temurin-17 to eclipse-temurin:17-jre-alpine) to minimize image size and maximize runtime security.
```bash
# Build and start services (Backend, PostgreSQL, Redis, and Observability stack) in detached mode
docker-compose up -d --build backend
```

---

## 🐳 Docker Deployment
We utilize a **multi-stage Docker build** process to minimize image size and maximize security.

1. **Build Stage:** Uses `maven:3.9-eclipse-temurin-17` to compile code and package the application.
2. **Runtime Stage:** Uses `eclipse-temurin:17-jre-alpine`, reducing the attack surface and deployment footprint.

```bash
# Build the image
docker build -t chess-backend .

# Run the system using orchestration
docker-compose up -d backend
```

---

## 🧪 Testing Strategy
Our testing methodology ensures high code quality through a layered approach, utilizing **JUnit 5**, **Mockito**, and **Spring Boot Test**.

* **Web Layer (Controllers):** Validated using `@WebMvcTest`. Tests HTTP endpoints, JSON serialization, and Springdoc specs.
* **Business Layer (Services):** Validated using `MockitoExtension` and transactional integrity boundaries.
* **Test Isolation:** We use `@Profile("!test")` to explicitly disable external Redis and distributed lock dependencies during unit test execution.
* **Coverage & Quality:** Enforced via `jacoco-maven-plugin` and static code analysis tools.

---

## 🛠️ Technical Best Practices
To maintain high performance and code quality, please follow these guidelines:

* **Concurrency Control:** Always use `@RLock` via Redisson for game state operations and lobby joins to prevent race conditions.
* **Transactional Integrity:** Keep ACID transaction boundaries (`@Transactional`) within the `Application Layer` to safeguard data modifications.
* **Observability:** Monitor critical flows using Micrometer observations and structured SLF4J logging mapped with custom categories (`GAME_ACTION`, `ADMIN_ACTION`, etc.).

---

## 📁 Source Code Structure (Main)
```text
src/main/
├── java/com/batuhan/chess/
│   ├── api/                            # Infrastructure Layer: External interfaces
│   │   ├── config/                     # Protocol configs (Security, WebSocket, Redis, OpenAPI)
│   │   ├── controller/                 # REST Controllers & STOMP WebSocket Handlers
│   │   ├── dto/                        # Immutable Data Transfer Objects (Payloads for admin, auth, error, game, lobby, and user)
│   │   └── exception/                  # Global API error handlers (@RestControllerAdvice)
│   ├── application.service/            # Application Layer: Use case orchestration
│   │   ├── admin/                      # Administrative use cases & audits
│   │   ├── auth/                       # Identity, JWT, and guest session handling
│   │   ├── game/                       # Game session coordination, Stockfish, & Redisson locks
│   │   └── user/                       # User profile and account management services
│   ├── domain/                         # Domain Layer: Pure business logic
│   │   ├── model/                      # Aggregates and Entities
│   │   │   ├── admin/                  # Admin domain models
│   │   │   ├── chess/                  # Sealed piece hierarchy, Board, & Rules engine
│   │   │   ├── history/                # Persistent match tracking & Elo ratings
│   │   │   └── user/                   # User aggregate models
│   │   └── repository/                 # Repository INTERFACES (JpaRepository)
│   └── ChessBackendApplication         # Main application entry point                                
└── resources/
    ├── application.yaml                # Main application configuration properties
    ├── application-local.yaml          # Local development profile configurations
    ├── application-prod.yaml           # Production profile configurations
    ├── engine/
    │   └── stockfish.exe               # Bundled Stockfish UCI binary
    └── db.changelog/                   # Liquibase migration configuration root
        ├── changes/                    # SQL migration scripts (001-initial-schema.sql)
        └── db.changelog-master.xml     # Master changelog file
```

## 🧪 Test Structure (Test)
- This section houses the test classes and resources used to verify the correctness of each layer and ensure application reliability.

```text
src/test/
├── java/com/batuhan/chess/
│   ├── api/                            # API Layer unit & integration tests (config, controller, dto, exception)
│   ├── application.service/            # Application layer business logic & lock tests (admin, auth, game, user)
│   ├── domain/                         # Domain layer tests (model aggregates: admin, chess, history, user; and repository tests)
│   └── ChessBackendApplicationTests    # Main application context test
└── resources/
    └── application-test.yaml           # Test-specific configuration profile
```

---

## ⚠️ Troubleshooting
* **Database Connection:** Verify that PostgreSQL is running and your `CHESS_DB_URL` in `.env` is reachable.
* **Redis Failures:** Ensure the Redis server is active, as it is required for distributed locking.
* **JWT Authentication:** If you receive 403 errors, verify that `CHESS_JWT_SECRET` is correctly set and the token is valid.

---

## 📝 Credits
* **Spring Boot:** Core framework for building production-ready applications.
* **Resilience4j:** Fault tolerance and circuit breaking.
* **Redisson:** Redis-based distributed locking and data structures.
* **Liquibase:** Database schema management and versioning.

---
*For global project guidelines, contributing policies, and licensing, please refer to the [root README](../README.md).*
