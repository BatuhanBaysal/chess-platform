# 🏗️ Architectural Blueprint

This document outlines the high-level design choices and architectural patterns used in the **Chess Platform**.

---

## 🧩 Hexagonal Architecture (Ports & Adapters)
To ensure the core chess logic remains independent of frameworks and external tools, we follow the Hexagonal pattern:

* **Domain Hexagon:** Contains pure Java logic (Pieces, Board, Move rules). **Zero dependencies** on Spring Framework or database drivers to ensure maximum testability.
* **Driving Adapters (Input):** REST Controllers and WebSocket (STOMP) handlers that trigger domain actions.
* **Driven Adapters (Output):** PostgreSQL persistence (JPA), and external messaging adapters.

## 🛡️ Domain-Driven Design (DDD) Approach
We treat the Chess Engine as a bounded context with clear tactical patterns:

* **Entities:** `Board`, `Game` (Objects with unique identity and state lifecycle).
* **Value Objects:** [**Position.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Position.java), [**Color.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Color.java) (Immutable objects defined by their attributes).
* **Aggregates:** The `Board` acts as an **Aggregate Root** to maintain invariants and consistency during piece movements.
* **Domain Services:** `MoveValidationService` (Planned) to handle complex rules such as Castling or En Passant that involve multiple domain objects.

## 🧵 Java 17+ Modern Features
We leverage modern Java capabilities to ensure **Type Safety** and **Clean Code**:

1.  **Sealed Classes:** The [**Piece.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Piece.java) hierarchy is strictly defined using `sealed` classes to enforce exhaustive pattern matching.
2.  **Records:** Used for DTOs and internal data carriers to guarantee immutability by default.
3.  **Pattern Matching:** Simplifies movement logic by utilizing `switch` enhancements and `instanceof` pattern matching for piece types.

---
*Status: Architecture established. Implementation following the "Test-First" (TDD) methodology.*
