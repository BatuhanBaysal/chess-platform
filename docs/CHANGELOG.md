# 📜 Changelog

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-16

### ♟️ Phase 2: Core Domain Modeling & Piece Logic
> **Note:** This release marks the completion of all 6 individual piece movement rules, board initialization, and the central game orchestrator.

- **2026-03-16:**
    - **Game Orchestration (PR #9):** Implemented [**Game.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Game.java) to act as the central domain orchestrator for turn management, move execution, and game lifecycle.
    - **Game Status Logic:** Introduced [**GameStatus.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/GameStatus.java) to track session states (Active, Resigned, etc.) and integrated a `resign` mechanism.
    - **Unit Validation:** Developed [**GameTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/GameTest.java) to validate turn-switching, out-of-turn move prevention, and state-based restrictions.
    - **Phase Milestone:** Formally completed **Phase 2: Domain Modeling**, establishing a fully functional movement engine.
- **2026-03-15:**
    - **King Implementation (PR #7, #8):** Finalized [**King.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/King.java) logic and movement validation. This update resolves missing domain components and completes the initial piece hierarchy.
    - **Unit Validation:** Implemented [**KingTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/KingTest.java) to ensure 100% coverage for King-specific movement constraints.
- **2026-03-14:**
    - **Queen Implementation (PR #6):** Implemented [**Queen.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Queen.java) by harmonizing linear and diagonal movement patterns.
    - **Unit Validation:** Added [**QueenTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/QueenTest.java) for comprehensive sliding movement verification.
- **2026-03-13:**
    - **Rook Implementation (PR #5):** Developed [**Rook.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Rook.java) with a directional scanning algorithm for horizontal/vertical moves.
    - **Unit Validation:** Verified scanning logic via [**RookTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/RookTest.java).
- **2026-03-12:**
    - **Bishop Implementation (PR #4):** Implemented diagonal validation in [**Bishop.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Bishop.java) using coordinate difference logic.
    - **Unit Validation:** Conducted diagonal move tests in [**BishopTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/BishopTest.java).
- **2026-03-11:**
    - **Knight Implementation (PR #3):** Created [**Knight.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Knight.java) using fixed-offset validation (L-shape).
    - **Unit Validation:** Validated jump ability and L-move constraints in [**KnightTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/KnightTest.java).
- **2026-03-10:**
    - **Pawn Implementation (PR #2):** Developed [**Pawn.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Pawn.java) with initial double-step and conditional capturing.
    - **Unit Validation:** Tested forward-only and diagonal capture scenarios in [**PawnTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/PawnTest.java).
- **2026-03-09:**
    - **Domain Foundations (PR #1):** Established the core 8x8 [**Board.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Board.java) infrastructure and the **Sealed** [**Piece.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Piece.java) hierarchy.
    - **Value Objects & Types:** Implemented immutable domain descriptors: [**Position.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Position.java), [**Color.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/Color.java), and [**PieceType.java**](../chess-backend/src/main/java/com/batuhan/chess/domain/model/PieceType.java).
    - **Unit Validation:** Implemented [**BoardTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/BoardTest.java) and [**PositionTest.java**](../chess-backend/src/test/java/com/batuhan/chess/domain/model/PositionTest.java) to verify coordinate management, board state invariants, and object immutability.

---

## [0.1.0] - 2026-03-08

### ✨ Initial Infrastructure & Monorepo Setup
- Initialized **Chess Backend** (Spring Boot 3.4.6) and **Chess Frontend** (React 19 + Vite).
- Developed core project governance: `SECURITY.md`, `LICENSE`, and `CONTRIBUTING.md`.
- Integrated [`.editorconfig`](../.editorconfig) and secure environment management via [`.env.example`](../.env.example).

### ⚙️ Strategic Planning & Engineering Standards
- **SDLC & Architecture:** Defined the **Domain-Driven Design (DDD)** and **Clean Architecture** roadmap.
- **Workflow Governance:** Established strict **Gitflow** and **Conventional Commits** (refer to [**Git Guide**](../.github/GIT_GUIDE.md)).
- **Quality Assurance:** Formulated a "Test-First" approach for domain-level logic.

---
*Standard: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)*
