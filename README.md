# ♟️ Chess Platform

> *A Production-Ready Real-Time Chess Ecosystem Powered by Hexagonal Architecture and the LGTM Stack.*

![Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-v2.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 Overview
**Chess Platform** is a professional-grade, real-time multiplayer chess ecosystem. Designed as a **single source of truth** for game state, the platform synchronizes complex board interactions between the server and client with sub-millisecond precision.

> **In simple terms:** Think of this as a "referee-in-the-cloud" chess game. By keeping all the core business logic, validation rules, and timers on the server, we ensure that client-side manipulation is impossible and the game remains perfectly synced.

### 🎯 What We Do
* **Secure Onboarding:** A robust authentication, JWT-based security, and registration flow.
* **Server-Authoritative Rule Engine:** **Developed entirely in-house using Java.** We do not rely on third-party APIs for game rules. Every move (Castling, En Passant, Promotion) is validated server-side by our custom domain logic to ensure 100% integrity.
* **Real-Time Multiplayer:** A reactive, event-driven architecture using WebSockets for seamless player-vs-player matches.
* **Integrated AI Training Mode:** Leveraging the industry-standard **Stockfish engine** as a local sidecar, allowing users to play against a powerful AI opponent in single-player sessions, while still utilizing our core server-authoritative logic for move validation.
* **Resilient Infrastructure:** Automated state recovery and connection management to handle network interruptions gracefully.

---

### 🎬 Feature Highlights
<img src="docs/assets/videos/v1-gameplay-highlight.gif" style="max-width: 100%; height: auto;" alt="Gameplay Highlight">

> **Real-Time Multiplayer Synchronization:** A demonstration of the platform's reactive architecture. The side-by-side view shows a game session synchronized across two independent browser sessions, highlighting instant state updates, server-authoritative move validation, and low-latency WebSocket communication.

* **Multiplayer Duel:** Real-time matches powered by our custom-built FIDE-compliant Java engine.
* **🤖 Player vs. AI (Stockfish Engine):** Integrated UCI-protocol-based engine support. Users can initiate single-player matches against a high-performance AI, managed by our robust backend lifecycle controller.
* **System Demonstrations:** You can explore the [Authentication Workflow](docs/assets/videos/v1-auth-workflow.mp4) 🔐, [Lobby & Navigation](docs/assets/videos/v1-lobby-navigation.mp4) 🧭, and [Board Interactivity](docs/assets/videos/v1-gameplay-board.mp4) ♟️ video guides.
* **System Snapshots:** Check out the [Dashboard Assets](docs/assets/dashboards/) 📊, [Infrastructure Snapshots](docs/assets/screenshots/01-infrastructure/) 🏗️, [UI & UX Highlights](docs/assets/screenshots/02-gameplay-features/) ♟️, and [Test Reports & Swagger UI](docs/assets/screenshots/03-api-testing/) 🧪 for a complete visual overview.

---

## 🏛️ Project Ecosystem & Governance
This project is architected as a **high-cohesion monorepo**. Operational processes and architectural decisions are managed through the following modules:

| Module / Document | Purpose & Brief | Location |
| :--- | :--- | :--- |
| **⚙️ Backend** | Domain-Driven Chess Engine, REST/WebSocket APIs & FIDE logic | [chess-backend](chess-backend) |
| **🎨 Frontend** | Reactive React 19 UI, Real-time state & Modular components | [chess-frontend](chess-frontend) |
| **🏗️ Architecture** | Unifies hexagonal patterns, DDD principles, and data flow design | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **🧪 Infrastructure** | Details the LGTM observability stack, SonarQube, and system resilience | [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) |
| **🚀 Deployment** | Production-ready container orchestration and monitoring scripts | [deploy/monitoring](deploy/monitoring) |
| **🤖 CI/CD & Templates** | GitHub Actions workflows, Issue & PR templates | [.github](.github) |
| **🚀 Setup Guide** | Local environment config, prerequisites, and dependency management | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| **📝 Git Flow** | Version control standards, branching strategies, and conventional commits | [docs/GIT_GUIDE.md](docs/GIT_GUIDE.md) |
| **📜 Changelog** | Version history, milestone tracking, and lifecycle events | [docs/CHANGELOG.md](docs/CHANGELOG.md) |
| **🛡️ Security** | Authentication policies, safety disclosures, and best practices | [SECURITY.md](SECURITY.md) |
| **⚖️ Code of Conduct** | Community standards, inclusion guidelines, and etiquette | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| **🤝 Contributing** | PR workflow, issue templates, and collaboration standards | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) |
| **📜 License** | Project legal usage and distribution terms | [LICENSE](LICENSE) |

---

## 🚀 Quick Start

Ensure you have [Docker](https://www.docker.com/) and Docker Compose installed on your machine.

To spin up the core services (Backend, Frontend, DB, Redis) required for development:

```bash
docker compose --profile core up -d
```

To spin up the entire ecosystem, including monitoring tools and SonarQube:

```bash
docker compose --profile core --profile monitoring up -d
```

*For detailed setup instructions, please refer to the [Development Guide](docs/DEVELOPMENT.md).*

---

## 🐳 Infrastructure & Containerization
The entire application ecosystem is managed using **Docker Compose** to ensure absolute consistency between development and production environments.

![Docker Startup Assets](docs/assets/screenshots/01-infrastructure/docker-setup/01-docker-desktop-dashboard.png)

> **Resilient Orchestration & Health Checks:** All core services and observability tools utilize automated health check protocols and strict dependency ordering (e.g., ensuring PostgreSQL and Redis are fully ready before the Spring Boot backend initializes). This deterministic boot sequence effectively eliminates race conditions and "Connection Refused" errors during startup.

---

## 🏗️ Engineering Highlights

* **🧩 Custom FIDE Rule Engine:** Core game logic is encapsulated in a pure Java domain layer, ensuring complete control and zero reliance on external APIs for multiplayer validation.
* **🧠 Stockfish AI Integration:** Advanced AI support for single-player training, allowing users to challenge the Stockfish engine via our dedicated `StockfishService` which manages UCI communication and process lifecycle.
* **⚡ Robust Architecture:** A clean, hexagonal approach that separates our custom-built rule engine from infrastructure components like WebSockets, Persistence, and the AI Engine sidecar.
* **🔄 Full-Stack Observability & Tracing:** Real-time system health, centralized logging, and distributed tracing managed end-to-end by the **LGTM stack**.
* **🖥️ Modern React (v19) Stack:** High-performance UI utilizing Tailwind CSS designed for low-latency, real-time interaction.
* **🏆 Zero Technical Debt & Quality Gates:** CI/CD-driven quality standards enforced via **SonarQube**.

---

## 📋 Project Governance & Workflow
We maintain a strict professional workflow to ensure code quality, automated validation, and project transparency:

* **Agile Management:** Track our active roadmap, sprints, and task progress via the [**Chess Platform Kanban Board**](https://github.com/users/BatuhanBaysal/projects/2).
* **Release Lifecycle:** Track all version milestones, production-ready releases, and [**version tags**](https://github.com/BatuhanBaysal/chess-platform/tags) through our [**GitHub Releases**](https://github.com/BatuhanBaysal/chess-platform/releases).
* **Continuous Integration & Quality Gates:** Code health, automated test suites, and build pipelines are continuously validated via **GitHub Actions**. You can inspect the status of active workflows, build statuses, and quality checks directly on our [**GitHub Actions Pipeline**](https://github.com/BatuhanBaysal/chess-platform/actions).
* **Automation & Standardisation:** Our repository is governed by standardized contribution templates for issue reporting and pull requests.
    * **Issue Tracking:** Use our pre-defined templates for [Bug Reports](https://github.com/BatuhanBaysal/chess-platform/issues/new?assignees=&labels=bug&template=bug_report.md) and [Feature Requests](https://github.com/BatuhanBaysal/chess-platform/issues/new?assignees=&labels=enhancement&template=feature_request.md).
    * **Pull Requests:** All contributions follow a strictly reviewed and automated PR verification process using our standard [Pull Request Template](https://github.com/BatuhanBaysal/chess-platform/blob/main/.github/pull_request_template.md).

---

## 👨‍💻 Developed By
**Batuhan Baysal** - *Software Engineer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/batuhan-baysal) [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BatuhanBaysal)
