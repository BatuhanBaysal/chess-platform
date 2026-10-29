# 🚀 Developer Onboarding & Local Environment Guide

This guide details the prerequisites, local service orchestration, and execution workflows required to build and debug the **Chess Platform** monorepo (`chess-backend` and `chess-frontend`).

---

## 📂 Monorepo Structure

```text
chess-platform/
├── .github/                # CI/CD workflows (ci.yml)
├── .idea/                  # Shared IntelliJ IDEA configurations
├── chess-backend/          # Spring Boot 3.4.6 (Java 17) Backend Engine
├── chess-frontend/         # React 19 (TypeScript + Vite) Client
├── deploy/                 # Production & local infrastructure configs
│   ├── keycloak/           # Keycloak realm import template (realm-export.json)
│   └── monitoring/         # LGTM stack configs (Loki, Tempo, Prometheus, Promtail, Grafana)
├── docs/                   # System documentation & technical specifications
│   └── assets/             # Screenshots, sequence diagrams, and benchmarks
├── .editorconfig           # Monorepo code style formatting standards
├── .env.example            # Environment variables template
├── .gitattributes          # Git line endings and Git LFS binary rules
├── .gitignore              # Global exclusion filters
├── docker-compose.yml      # Multi-profile container orchestration
├── LICENSE                 # Open-source license
└── README.md               # Root repository entry point
```

---

## 🛠 Prerequisites & Tooling

Ensure the following runtimes and tools are installed:

* **Container Runtime:** [Docker Desktop](https://www.docker.com/) or Docker Engine with Docker Compose v2.
* **Java Development Kit:** [Amazon Corretto 17](https://aws.amazon.com/corretto/) or Eclipse Temurin 17 JDK.
* **Build Tool:** Apache Maven 3.9+ (or use the bundled `./mvnw` wrapper).
* **Node.js Ecosystem:** [Node.js LTS (v20+)](https://nodejs.org/) & `npm` (required for React 19 and Vite).
* **Git & Git LFS:** [Git LFS](https://git-lfs.github.com/) is **mandatory** to pull executable Stockfish binaries.
* **Recommended IDEs:** IntelliJ IDEA (Backend) and VS Code / WebStorm (Frontend).

### 🗄️ Local Infrastructure & Dashboard Ports

When running dependent services via Docker Compose, the following endpoints are exposed locally:

| Service | Port / URL | Profile | Default Local Credentials |
| :--- | :--- | :--- | :--- |
| **Backend API** | `http://localhost:8080` | `core` | Secured via Keycloak JWT |
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` | `core` | Public OpenAPI documentation |
| **Actuator Health** | `http://localhost:8080/actuator/health` | `core` | Public health verification |
| **Frontend (Vite Dev)** | `http://localhost:5173` | Local Dev | Single-Page Application UI |
| **Keycloak IAM** | `http://localhost:8081` | `core` | `admin` / `admin` |
| **RabbitMQ Management** | `http://localhost:15672` | `core` | `guest` / `guest` |
| **MinIO Storage Console** | `http://localhost:9001` | `storage-local` | `minioadmin` / `minioadmin` |
| **Grafana Dashboards** | `http://localhost:3000` | `monitoring` | `admin` / `admin` |
| **Prometheus Metrics** | `http://localhost:9090` | `monitoring` | Raw scraped Prometheus metrics |
| **SonarQube Quality** | `http://localhost:9002` | `quality` | Configure password on initial login |

---

## 📥 Initial Setup Workflow

### 1. Clone & Git LFS Initialization
Stockfish binaries are tracked with Git LFS. Initialize LFS before cloning:
```bash
git lfs install
git clone https://github.com/BatuhanBaysal/chess-platform.git
cd chess-platform
git lfs pull
```

### 2. Environment Configuration
Generate your local `.env` file from the root template:
```bash
cp .env.example .env
```
Ensure database credentials, Keycloak secrets, and local storage values match your local development environment.

---

## ⚙️ Running the Backend (`chess-backend`)

### 1. Start Dependent Infrastructure
The Spring Boot backend requires PostgreSQL, Redis, RabbitMQ, and Keycloak to be healthy:
```bash
# Starts core backing services in the background
docker compose up -d db redis rabbitmq keycloak
```

*(Optional) Start local MinIO object storage if testing avatar uploads:*
```bash
docker compose --profile storage-local up -d minio
```

### 2. IDE Configuration (IntelliJ IDEA)
1. **SDK:** Set Project SDK to **17 (Amazon Corretto or Temurin)**.
2. **Language Level:** Set to **17 - Sealed types, records**.
3. **Environment Injection:** Enable the `EnvFile` plugin or load `.env` variables into the Spring Boot Run Configuration.
4. **Active Profile:** Set `spring.profiles.active=local`.

### 3. Build & Run via Terminal
```bash
cd chess-backend

# Execute complete test suite (Docker Daemon must be running for Testcontainers)
./mvnw clean test

# Boot the application using the local profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 🎨 Running the Frontend (`chess-frontend`)

### 1. Install Dependencies
```bash
cd chess-frontend
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
# The client is available at http://localhost:5173
```

### 3. Run Component & E2E Tests
```bash
# Run Vitest component and hook test suites
npm test

# Run Playwright end-to-end browser tests
npm run test:e2e
```

---

## 🐳 Full Containerized Deployment (Docker Compose)

For testing the production-identical ecosystem without running local IDEs:

```bash
# 1. Run core application (Backend, Frontend, DB, Redis, RabbitMQ, Keycloak):
docker compose --profile core up -d --build

# 2. Run full platform including local MinIO and LGTM monitoring:
docker compose --profile core --profile storage-local --profile monitoring up -d --build

# 3. View live logs:
docker compose logs -f backend

# 4. Stop and clean up containers:
docker compose down
```

---

## 🧪 Testing Guidelines

* **Backend Testcontainers:** Unit and integration tests automatically spawn a disposable PostgreSQL container. Ensure Docker Desktop is active.
* **Windows Troubleshooting:** If Testcontainers fails to clean up containers on Windows, set the following environment variable:
  ```text
  TESTCONTAINERS_RYUK_DISABLED=true
  ```
* **Detailed Specifications:** For complete test suite breakdowns, mock boundaries, and concurrency matrices, see [**TESTING.md**](TESTING.md).
