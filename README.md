# ♟️ Chess Platform

> *An Enterprise-Grade, Full-Stack Chess Ecosystem Featuring Server-Authoritative Logic, AI Integration, and Hybrid Cloud Production Deployment.*

![Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-v2.2.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 Overview
**Chess Platform** is a professional-grade, real-time multiplayer chess ecosystem. Designed as a **single source of truth** for game state, the platform synchronizes complex board interactions between the server and client through a low-latency, throttled WebSocket pipeline.

> **In simple terms:** Think of this as a "referee-in-the-cloud" chess game. By keeping all the core business logic, validation rules, and timers on the server, we ensure that client-side manipulation is impossible and the game remains perfectly synced.

### 🎯 What We Do
* **Secure Onboarding & RBAC:** A robust authentication flow featuring **Spring Security, JWT, and Role-Based Access Control (Admin vs. User)** with dedicated administrative dashboards.
* **Server-Authoritative Rule Engine:** **Developed entirely in-house using Java.** We do not rely on third-party APIs for game rules. Every move (Castling, En Passant, Promotion) is validated server-side by our custom domain logic to ensure 100% integrity.
* **Real-Time Multiplayer:** A reactive, event-driven architecture using WebSockets for seamless player-vs-player matches.
* **Integrated AI Training Mode:** Leveraging the industry-standard **Stockfish engine** as a local sidecar, allowing users to play against a powerful AI opponent in single-player sessions, while still utilizing our core server-authoritative logic for move validation.
* **Resilient Infrastructure:** Automated state recovery and connection management to handle network interruptions gracefully.

---

## 🏗️ Engineering Highlights

* **🧩 Custom FIDE Rule Engine:** Core game logic is encapsulated in a pure Java domain layer, ensuring complete control and zero reliance on external APIs for multiplayer validation.
* **🧠 Decoupled AI Sidecar & Telemetry Throttling:** Engine analysis integrated via the **UCI protocol** using a sidecar pattern. Features thread-safe concurrency management and throttled state broadcasting (`150ms`) to protect WebSocket throughput under heavy telemetry streams.
* **⚡ Hexagonal Architecture (Ports & Adapters):** Strict separation of concerns keeping the domain hexagon free from framework and database dependencies.
* **🔄 Full-Stack Observability & Tracing:** Real-time system health, centralized logging, and distributed tracing managed end-to-end by the **LGTM stack**.
* **🖥️ Modern React (v19) Stack & UI/UX:** High-performance user interface utilizing Tailwind CSS, interactive dashboards, and modular components designed for low-latency, real-time interaction.
* **🛡️ Server-Authoritative State Machine & RBAC:** Granular role-based access control protecting administrative operations via stateless JWT architecture, alongside decoupled business rules enforcing strict server-side validation to eliminate client-side tampering and race conditions.
* **🏆 Quality Gates:** CI/CD-driven quality standards enforced via **SonarQube** — **A-Grade Quality Gate**, 0 code smells, 0 open technical debt, with **74.0% test coverage** across 384 passing tests.
* **🌐 Production Deployment & Hybrid Cloud Architecture:**
    * **Frontend Hosting (Vercel):** The React 19 single-page application is hosted globally on Vercel (`https://chess-platform-app.vercel.app`), ensuring instant static asset delivery, automated continuous deployments tied to GitHub, and low-latency client interactions.
    * **Backend Infrastructure & Database (Oracle Cloud & Docker Compose):** The Spring Boot backend, PostgreSQL database, Redis instance, and LGTM observability stack are fully containerized and orchestrated via Docker Compose on an Oracle Cloud Infrastructure (OCI) Always Free ARM (Ampere) virtual private server.
    * **API & Domain Routing (Duck DNS):** The backend services communicate securely through the Oracle Cloud infrastructure mapped via Duck DNS, handling real-time REST and WebSocket traffic requested dynamically by the Vercel-hosted client.

> *For a deep dive into the underlying design patterns, concurrency controls, and architectural decisions, see our [Engineering Decisions Guide](docs/ENGINEERING_DECISIONS.md).*

---

### 🎬 Platform Walkthrough & Features

> *Curious about how everything comes together? This section walks you through the actual user journey, features, and capabilities built into the platform from scratch.*

<img src="docs/assets/videos/v2.1.0-gameplay-highlight.gif" style="max-width: 100%; height: auto;" alt="Multiplayer Gameplay Highlight">

> **👥 Real-Time Multiplayer Synchronization:** A demonstration of the platform's reactive architecture. The side-by-side view shows a game session synchronized across two independent browser sessions, highlighting instant state updates, server-authoritative move validation, and low-latency WebSocket communication.

> **🤖 Engine Analysis & AI Match:** The same server-authoritative core also powers single-player training mode against the Stockfish AI opponent — real-time move evaluations, live centipawn/mate scores via the evaluation bar, and intelligent engine hint suggestions guiding optimal move choices under high-frequency telemetry.

---

### 🗺️ The Complete User Journey & What I Built

As a solo developer, I designed and built this production-grade SaaS chess platform end-to-end. Here is how users interact with the system across key modules:

* **🔐 Authentication & Lobby:** Secure JWT-based onboarding through Spring Security leads users to a dynamic dashboard for game modes, system health, and changelogs.
* **♟️ Gameplay & AI Engine:**
    * Fully backend-authoritative multiplayer and room controls with zero client-side manipulation to prevent cheating.
    * Integrated **Stockfish AI** training mode with configurable difficulty levels.
    * Real-time move hint engine available across matches.
* **📊 Stats & Leaderboards:** PostgreSQL-backed match persistence powering comprehensive analytics, ELO ratings, win/loss ratios, match history, and global leaderboards.
* **👑 Admin & Recovery:** Dynamic role-based UI adaptation for administrative oversight and automated `gameId`-powered session recovery for dropped connections.

> **Visual Archives & Demos:**
> * [Video Guides Directory](docs/assets/videos/) 🎬
> * [Screenshots & Dashboards Directory](docs/assets/screenshots/) 📸

---

## 🏛️ Project Ecosystem, Governance & Workflow

This project is architected as a **high-cohesion monorepo** governed by a strict professional workflow to ensure code quality, automated validation, and project transparency. Operational processes, architectural blueprints, and testing guides are documented across the core modules:

| Module / Document | Purpose & Brief | Location                                         |
| :--- | :--- |:-------------------------------------------------|
| **⚙️ Backend Engine** | Domain-Driven Chess Engine, REST/WebSocket APIs & FIDE logic | [chess-backend](chess-backend)                   |
| **🎨 Frontend UI** | Reactive React 19 UI, Real-time state & Modular components | [chess-frontend](chess-frontend)                 |
| **🏗️ Architecture** | Unifies hexagonal patterns, DDD principles, and data flow design | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)     |
| **🧠 Engineering Decisions** | Deep-dive into concurrency controls, security layers, and patterns | [docs/ENGINEERING_DECISIONS.md](docs/ENGINEERING_DECISIONS.md) |
| **🧪 Testing Strategy** | Unit, integration slice tests, and SonarQube quality metrics | [docs/TESTING.md](docs/TESTING.md)               |
| **📊 Infrastructure** | Details the LGTM observability stack, SonarQube, and system resilience | [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) |
| **🚀 Deployment** | Production-ready container orchestration and monitoring scripts | [deploy/monitoring](deploy/monitoring)           |
| **🤖 CI/CD & Templates** | GitHub Actions workflows, Issue & PR templates | [.github](.github)                               |
| **🚀 Setup Guide** | Local environment config, prerequisites, and dependency management | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)       |
| **📝 Git Flow** | Version control standards, branching strategies, and conventional commits | [docs/GIT_GUIDE.md](docs/GIT_GUIDE.md)           |
| **📜 Changelog** | Version history, milestone tracking, and lifecycle events | [docs/CHANGELOG.md](docs/CHANGELOG.md)           |

We maintain rigorous standards across our development lifecycle:
* **Agile Management:** Track our active roadmap, sprints, and task progress via the [**Chess Platform Kanban Board**](https://github.com/users/BatuhanBaysal/projects/2).
* **Release Lifecycle:** Track all version milestones, production-ready releases, and [**version tags**](https://github.com/BatuhanBaysal/chess-platform/tags) through our [**GitHub Releases**](https://github.com/BatuhanBaysal/chess-platform/releases).
* **Continuous Integration & Quality Gates:** Code health, automated test suites, and build pipelines are continuously validated via **GitHub Actions** ([**Pipeline Status**](https://github.com/BatuhanBaysal/chess-platform/actions)).
* **Automation & Standardisation:** Governance is enforced via standardized templates for [Bug Reports](https://github.com/BatuhanBaysal/chess-platform/issues/new?assignees=&labels=bug&template=bug_report.md), [Feature Requests](https://github.com/BatuhanBaysal/chess-platform/issues/new?assignees=&labels=enhancement&template=feature_request.md), and our reviewed [Pull Request Template](https://github.com/BatuhanBaysal/chess-platform/blob/main/.github/pull_request_template.md).

**Additional Resources & Policies:** For further details, please review our [Security Policy](docs/SECURITY.md), [Code of Conduct](CODE_OF_CONDUCT.md), [Contributing Guidelines](docs/CONTRIBUTING.md), and project [License](LICENSE).

---

## 🚀 Quick Start
Ensure you have [Docker](https://www.docker.com/) and Docker Compose installed on your machine.

### 1. Development Mode (Docker)
To spin up the core services (Backend, Frontend, DB, Redis) required for development:

```bash
docker compose --profile core up -d
```

To spin up the entire ecosystem, including monitoring tools and SonarQube:

```bash
docker compose --profile core --profile monitoring up -d
```

### 2. Running Backend Locally (Without Docker)
If you prefer to run only the Spring Boot backend locally via your IDE (e.g., IntelliJ IDEA) while keeping supporting services (like DB/Redis) up:

1. **Active Profiles**: Set your Spring Boot active profile to `local` in your Run/Debug Configurations.
2. **EnvFile Plugin**: Install the EnvFile plugin in IntelliJ to securely load environment variables.
3. **Configuration Setup**: In your `ChessBackendApplication` run configuration, check **Enable EnvFile** and add your local `.env` file to the list as shown below:

⚠️ **Security Warning**: Never commit or share your `.env` file publicly. It contains sensitive credentials and configuration secrets.

### 3. Production Deployment
> ℹ️ **Note:** SonarQube and the `monitoring` profile have been removed from the production setup to avoid unnecessary data/resource usage on the server. Only the `core` profile is used in production.

To update and deploy the application to the production server:

3.1. Connect to your Oracle Cloud instance via SSH (ensure you have your private SSH key downloaded and proper permissions set):
```bash
ssh -i "/path/to/your/ssh-key.key" ubuntu@xxx.xxx.xxx.xxx
```

3.2. Navigate to the project directory and pull the latest changes:
```bash
cd ~/chess-platform
git pull origin main
```

3.3. Stop existing containers and clean up:
> ⚠️ **Important Note on Data Persistence:**
* If you want to **keep your database and volumes intact** (preserving user data, game history, and settings), run:
```bash
docker compose down
```
* If you want to **wipe everything and reset all data volumes** (useful for a completely fresh start or clean testing), use the `-v` flag:
```bash
docker compose down -v
```

3.4.Rebuild and restart the production services:
```bash
docker compose --profile core up --build -d
```

For detailed setup instructions, please refer to the [Development Guide](docs/DEVELOPMENT.md).

---

## 🐳 Infrastructure & Containerization
The entire application ecosystem is managed using **Docker Compose** to ensure absolute consistency between development and production environments.

![Docker Startup Assets](docs/assets/screenshots/01-infrastructure/docker-setup/01-docker-desktop-dashboard.png)

> **Resilient Orchestration & Health Checks:** All core services and observability tools utilize automated health check protocols and strict dependency ordering (e.g., ensuring PostgreSQL and Redis are fully ready before the Spring Boot backend initializes). This deterministic boot sequence effectively eliminates race conditions and "Connection Refused" errors during startup.

---

### 💡 Behind the Code: My Journey with This Project

> *"This platform is the culmination of a continuous learning curve that started during my corporate internship in the summer of 2024, where I first laid hands on Java, Spring Boot, React, and PostgreSQL."*

After graduation, through dedicated self-study, online programs, and hands-on GitHub development, I wanted to build something that goes beyond standard CRUD applications. This project stands as my most comprehensive work to date:
* **The Stack Evolution:** Moving beyond prior full-stack applications, I elevated my workflow by integrating containerization with **Docker** and full-stack observability via the **LGTM stack**.
* **Pushing Technical Boundaries:** To build multiplayer functionality, I bypassed conventional request-response cycles to master **WebSockets** for event-driven real-time synchronization. Integrating the **Stockfish engine** also provided deep experience with UCI protocols, sidecar patterns, and thread-safe telemetry.
* **Engineering Discipline:** Rather than treating this as a casual hobby project, I managed its lifecycle with the same discipline I'd want to bring to a professional team — leveraging GitHub Issues, PR workflows, Milestones, Tags, Releases, and comprehensive documentation.

> **What This Project Taught Me as an Engineer:**
> Successfully completing this end-to-end ecosystem transformed my approach to software development:
> * **Taking Full Ownership:** Steering a complex multi-module project independently taught me how to seamlessly bridge frontend, backend, and infrastructure gaps.
> * **Architectural Resilience:** I learned to anticipate edge cases—such as disconnections, state inconsistencies, and race conditions—designing structural safeguards from day one.
> * **Product-First Mindset:** Moving past isolated coding exercises, I gained the confidence to manage a full product lifecycle, balancing maintainability, automated quality gates, and structured documentation like a true production environment.

---

## 👨‍💻 Developed By
**Batuhan Baysal** - *Junior Software Developer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/batuhan-baysal) [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BatuhanBaysal)
