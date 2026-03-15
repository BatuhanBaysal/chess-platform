# ♟️ Chess Platform (Full-Stack Monorepo) ♔

**A high-performance, real-time chess ecosystem engineered with a focus on Domain-Driven Design (DDD), Clean Architecture, and Modern Java 17 standards.**

---

![Social Preview](docs/assets/social-preview.png)

### 🛠️ Technology Stack

**Backend:**
![Java 17](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot 3.4.6](https://img.shields.io/badge/Spring_Boot-3.4.6-green?style=flat-square&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JUnit 5](https://img.shields.io/badge/JUnit_5-C2185B?style=flat-square&logo=junit5&logoColor=white)
![Mockito](https://img.shields.io/badge/Mockito-Testing-yellowgreen?style=flat-square)

**Frontend:**
![React 19](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-blue?style=flat-square)

---

## 🏛️ Project Ecosystem & Governance
This project is architected as a **high-cohesion monorepo**. Operational processes and architectural decisions are managed through the following modules:

| Module / Document | Purpose & Brief | Location |
|:--- | :--- | :--- |
| **⚙️ Backend** | Core Chess Engine, API endpoints & Move validation logic | [`./chess-backend`](./chess-backend/README.md) |
| **🎨 Frontend** | Reactive UI components & Real-time board state management | [`./chess-frontend`](./chess-frontend/README.md) |
| **🏗️ Architecture** | High-level design choices (Hexagonal, DDD) & Tech patterns | [`./docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| **🚀 Setup Guide** | Comprehensive local environment & Dependency installation | [`./docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) |
| **📝 Git Flow** | Contribution workflow, Branching strategy & Commit standards | [`./.github/GIT_GUIDE.md`](./.github/GIT_GUIDE.md) |
| **📜 Changelog** | Daily Evolution, version tracking & project milestones | [`./docs/CHANGELOG.md`](./docs/CHANGELOG.md) |
| **🛡️ Security** | Security policies, safety disclosure & best practices | [`./docs/SECURITY.md`](./docs/SECURITY.md) |
| **🤝 Contributing** | Coding standards, PR guidelines & collaboration rules | [`./docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) |

---

## 🎯 Engineering Highlights

### 🧩 Domain-Driven Design (DDD)
The core chess logic is encapsulated in a **Pure Java** domain layer, entirely decoupled from Spring Boot or any infrastructure. This ensures 100% testability of the move validation engine.

### ⚡ Modern Java 17 Standards
* **Sealed Classes:** Used for the `Piece` hierarchy to enforce exhaustive pattern matching.
* **Records:** Utilized for immutable Game State snapshots and DTOs.

### 🔄 Real-Time System
* **WebSockets (STOMP):** Low-latency, bi-directional move transmission.
* **Dual-Database Strategy:** **PostgreSQL** for persistence, **H2** for isolated unit testing.

---

## 🚀 Roadmap
*Current Status: **Phase 2: Domain Modeling***

- ✅ **Phase 1: Foundation** - Monorepo scaffolding, CI/CD pipelines, and database initialization.
- 🏗️ **Phase 2: Domain Modeling** - Implementing Sealed Piece hierarchy and Board state management.
- ⏳ **Phase 3: Rule Engine** - Complex move validation (Checkmate, Stalemate, Castling, En Passant).
- ⏳ **Phase 4: Real-time Sync** - WebSocket (STOMP) integration for live move transmission.
- ⏳ **Phase 5: UI & UX** - Responsive board interface with React 19 and real-time state synchronization.

---

## 👨‍💻 Developed By
**Batuhan Baysal** - *Software Engineer* *Specializing in Scalable Software Design and Modern Backend Architectures.*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/batuhan-baysal) [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BatuhanBaysal) [![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:batuhanbaysal3@gmail.com)
