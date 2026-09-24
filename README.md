# ♟️ Chess Platform

> *A Full-Stack Chess Ecosystem Featuring Server-Authoritative Logic, AI Integration, Asynchronous Eventing, and Hybrid Cloud Production Deployment.*

![Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-v2.5.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🛠️ Tech Stack
* **Backend:** Java 17 • Spring Boot 3.4 • Maven • Spring Security • OAuth2 / Keycloak • WebSocket (STOMP) • Spring Data JPA • Liquibase • AWS SDK S3 • Resilience4j • Redisson • RabbitMQ
* **Frontend:** React 19 • TypeScript • Vite • Vitest • React Testing Library • Tailwind CSS • React Router • SockJS / STOMP • Recharts • DnD Kit
* **Infrastructure & Data:** PostgreSQL 17 • Redis 7 • MinIO • Docker Compose • Oracle Cloud (OCI) • Vercel
* **Developer Tools & Environment:** IntelliJ IDEA • VS Code • Postman • DBeaver • pgAdmin 4 • Docker Desktop • Git • GitHub Desktop • GitHub CLI • Node.js
* **Observability:** Prometheus • Grafana • Loki • Tempo • Promtail • OpenTelemetry

---

## 📖 Overview

**Chess Platform** is a production-grade, real-time multiplayer chess ecosystem built with clean architecture and strict server-authoritative state management. All game rules, timers, and state transitions execute entirely on the server to prevent client-side manipulation, synchronized via a low-latency, throttled WebSocket pipeline.

### 🎯 Core Capabilities

* **Identity & RBAC:** Centralized authentication via **Keycloak (OAuth2/OIDC Resource Server)** with fine-grained Role-Based Access Control and admin dashboards.
* **Pure In-House Rule Engine:** FIDE-compliant chess logic (Castling, En Passant, Promotion) developed natively in Java with zero third-party rule dependencies.
* **Event-Driven Multiplayer & Asynchronous Analytics:** Low-latency bidirectional WebSocket pipelines combined with **RabbitMQ** message brokers to decouple heavy Stockfish post-game analysis from core gameplay threads.
* **Stockfish AI Sidecar:** Integrated UCI-compliant engine for AI match play and live centipawn/mate evaluation telemetry.
* **Hybrid Storage Architecture:** Decoupled avatar and artifact storage supporting local MinIO and cloud-native OCI Object Storage via standard S3 SDK abstractions.

---

## 🏗️ Engineering Highlights

* **🧩 Clean / Hexagonal Architecture:** Strict separation between core domain rules, application use cases, and infrastructure adapters (Spring Boot, Keycloak, S3, PostgreSQL, RabbitMQ).
* **🧠 UCI Engine Sidecar & Throttling:** Thread-safe Stockfish subprocess management with throttled state broadcasting (`150ms`) to protect WebSocket throughput under heavy telemetry.
* **⚡ Resilient Concurrency & Recovery:** Server-authoritative state machine enforcing optimistic locking and deterministic session recovery for dropped connections.
* **🔄 Full-Stack Observability & Tracing:** Distributed tracing via **OpenTelemetry Java Agent**, metric collection, and structured logging unified across the **LGTM stack** (Loki, Grafana, Tempo, Prometheus).
* **🖥️ Modern React 19 Frontend:** State-driven UI built with React 19, TypeScript, and Tailwind CSS for responsive board rendering and match interactions.
* **🏆 Quality Gates & Testing:** CI/CD pipeline enforcing automated AAA unit/integration test suites (**74.0% coverage** across comprehensive test scenarios).
* **🌐 Production Cloud Deployment:**
    * **Frontend:** Deployed globally on Vercel for high-speed edge delivery.
    * **Backend & Infrastructure:** Containerized via Docker Compose on Oracle Cloud Infrastructure (ARM/Ampere VPS) with DuckDNS dynamic routing.

> *For an in-depth breakdown of architectural patterns, concurrency controls, and design tradeoffs, refer to the [Engineering Decisions Guide](docs/ENGINEERING_DECISIONS.md).*

---

## 🎬 Platform Walkthrough & Core Capabilities

<img src="docs/assets/videos/v2.1.0-gameplay-highlight.gif" style="max-width: 100%; height: auto;" alt="Multiplayer Gameplay Highlight">

* **⚡ Real-Time Multiplayer Sync:** Low-latency bidirectional WebSocket communication delivering instant state replication, server-authoritative move validation, and automated session recovery.
* **♟️ Stockfish AI & Telemetry:** Configurable single-player training mode featuring real-time centipawn evaluation, dynamic eval bar updates, and move hint generation via the UCI engine protocol.
* **🔐 Identity & Access Management:** Centralized Keycloak OAuth2/OIDC authentication with role-based access control (RBAC), guest sessions, and token introspection.
* **📊 Analytics & Rating Engine:** Persistent match analytics, live ELO ratings, and historical telemetry backed by PostgreSQL.
* **📁 Cloud Artifacts:** Decoupled avatar uploads and PGN game export pipelines integrated via S3-compatible object storage.

### ♟️ The User Experience & Gameplay Flow
* **Role-Based Onboarding & Lifecycle:** Players register/log in securely via Keycloak or join anonymously as guests. Registered users start with a base **1200 ELO rating** and full profile persistence, while guest sessions initialize at **400 ELO** and automatically expire after **7 days**. Users with the `ADMIN` role gain access to a dedicated administrative dashboard for system monitoring and telemetry oversight.
* **Matchmaking & Dynamic Rooms:** Create new multiplayer rooms with custom time controls (3, 10, 30 mins) and board aesthetics, or join existing active channels with synchronized timers and instant state updates.
* **Stockfish AI Arena:** Practice solo against configurable AI difficulty levels featuring real-time centipawn evaluation bars and dynamic move hint suggestions.
* **Strict Match Integrity & Persistence:** Every match outcome is deterministically tracked and persisted in PostgreSQL—including checkmates, stalemates, draws, timeout flags, and resignations/disconnections.
* **Player Command Center & Leaderboards:** Comprehensive dashboards display personal win/loss/draw match distributions, recent deployment history, dynamic ELO ratings, and global top player leaderboards.

Explore visual assets: [Video Guides](docs/assets/videos/) 🎬 | [Screenshots & Dashboards](docs/assets/screenshots/) 📸

---

## 🏛️ Project Ecosystem, Governance & Workflow

This project is architected as a **high-cohesion monorepo** governed by a strict professional workflow to ensure code quality, automated validation, and project transparency. Operational processes, architectural blueprints, and testing guides are documented across the core modules:

| Module / Document | Purpose & Brief                                                           | Location                                         |
| :--- |:--------------------------------------------------------------------------|:-------------------------------------------------|
| **⚙️ Backend Engine** | Domain-Driven Chess Engine, REST/WebSocket APIs & FIDE logic              | [chess-backend](chess-backend)                   |
| **🎨 Frontend UI** | Reactive React 19 UI, Real-time state & Modular components                | [chess-frontend](chess-frontend)                 |
| **🏗️ Architecture** | Unifies hexagonal patterns, DDD principles, and data flow design          | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)     |
| **🧠 Engineering Decisions** | Deep-dive into concurrency controls, security layers, and patterns        | [docs/ENGINEERING_DECISIONS.md](docs/ENGINEERING_DECISIONS.md) |
| **🧪 Testing Strategy** | Unit, integration slice tests, and code quality metrics                   | [docs/TESTING.md](docs/TESTING.md)               |
| **📊 Infrastructure** | Details the LGTM observability stack, Keycloak, MinIO, and system resilience    | [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) |
| **🚀 Deployment** | Production-ready container orchestration and monitoring scripts           | [deploy/monitoring](deploy/monitoring)           |
| **🤖 CI/CD & Templates** | GitHub Actions workflows, Issue & PR templates                            | [.github](.github)                               |
| **🚀 Setup Guide** | Local environment config, prerequisites, and dependency management        | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)       |
| **📝 Git Flow** | Version control standards, branching strategies, and conventional commits | [docs/GIT_GUIDE.md](docs/GIT_GUIDE.md)           |
| **📜 Changelog** | Version history, milestone tracking, and lifecycle events                 | [docs/CHANGELOG.md](docs/CHANGELOG.md)           |

Development lifecycle and quality standards are managed transparently via our [Kanban Board](https://github.com/users/BatuhanBaysal/projects/2), [GitHub Actions CI pipelines](https://github.com/BatuhanBaysal/chess-platform/actions), and versioned [GitHub Releases](https://github.com/BatuhanBaysal/chess-platform/releases) with tagged milestones. Contribution governance is enforced through structured issue and [PR templates](https://github.com/BatuhanBaysal/chess-platform/blob/main/.github/pull_request_template.md), backed by our [Security Policy](docs/SECURITY.md), [Code of Conduct](CODE_OF_CONDUCT.md), [Contributing Guidelines](docs/CONTRIBUTING.md), and [License](LICENSE).

---

## 🐳 Infrastructure & Containerization
The entire application ecosystem is managed using **Docker Compose** with segmented profiles (`core`, `monitoring`, `storage-local`) to ensure absolute consistency between local development and cloud production environments.

![Docker Startup Assets](docs/assets/screenshots/01-infrastructure/docker-setup/01-docker-desktop-dashboard.png)

> **Resilient Orchestration & Health Checks:** All core services and observability tools utilize automated health check protocols and strict dependency ordering. The Spring Boot backend initializes only after PostgreSQL, Redis, and the Keycloak IAM server are fully ready and passing health checks, while local object storage is decoupled via MinIO. This deterministic startup sequence eliminates race conditions and transient connection failures across both local development and containerized deployments.

---

## 🚀 Quick Start

Prerequisite: [Docker](https://www.docker.com/) & Docker Compose.

### Local Development

* **Core Stack (App, DB, Keycloak, Redis):**
```bash
  docker compose --profile core up -d
```

* **Full Local Stack (App, DB, Keycloak, Redis, MinIO + SonarQube + Monitoring):**
```bash
  docker compose --profile core --profile storage-local --profile quality --profile monitoring up -d
```

* **Running Backend via IDE:** Start dependent services with Docker, set the Spring active profile to `local`, and load your root `.env` via the IntelliJ EnvFile plugin.

### Production Deployment

1. **Connect & Update:**
```bash
   ssh -i "/path/to/key.key" ubuntu@<SERVER_IP>
   cd ~/chess-platform && git pull origin main
```

2. **Restart Services:**
```bash
   docker compose down   # Keep data volumes intact (use -v only for a hard reset)
   docker compose --profile core up --build -d
```

See the [Development Guide](docs/DEVELOPMENT.md) for full configuration details.

---

## 💡 Behind the Code: My Journey with This Project

> *"This platform is the culmination of a continuous learning curve that started during my internship at Chippin (part of Koç Group) in the summer of 2024, where I first laid hands on Java, Spring Boot, React, and PostgreSQL."*

After graduation, through self-study and hands-on GitHub development, I wanted to build something that goes beyond standard CRUD applications. This project is where most of my learning actually happened:

* **Learning by Getting It Wrong First:** The authentication layer started as a hand-rolled JWT implementation. It worked, but maintaining my own token lifecycle, role mapping, and session handling taught me exactly why that's a solved problem — so I migrated the whole thing to **Keycloak (OAuth2/OIDC)**. Rewriting something I'd already "finished" was the most useful thing I did on this project.
* **Distributed Real-Time Systems:** Building multiplayer meant moving past conventional request-response cycles to **WebSockets** and event-driven state sync. Integrating the **Stockfish engine** pushed me further into UCI protocols, sidecar patterns, and thread-safe process telemetry — areas I had no exposure to beforehand.
* **Resilience by Design:** Hitting real race conditions in matchmaking and real "connection refused" failures on startup taught me to design for concurrency and dependency ordering upfront, instead of patching symptoms after the fact.
* **Engineering Rigor:** Rather than treating this as a casual side project, I ran its lifecycle the way I'd want to work on a team — milestone-driven sprints, PR reviews, Liquibase migrations, AAA testing, and automated release workflows.

What I'd tell a past version of myself: building the feature is the easy half. Deciding *why* it should be built that way, and being willing to throw out working code when the reasoning doesn't hold up, is where the actual engineering is.

---

## 👨‍💻 Developed By
**Batuhan Baysal** - *Junior Software Developer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/batuhan-baysal) [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BatuhanBaysal)
