# 🚀 Development & Setup Guide

This guide provides the necessary steps to set up the Chess Platform from scratch or by cloning, ensuring a consistent development environment.

---

## 📂 Project Structure
Based on the current monorepo architecture:

```text
chess-platform/
├── .github/                # GitHub workflows and project standards (GIT_GUIDE.md)
├── .idea/                  # Shared IntelliJ IDEA configuration
├── chess-backend/          # Spring Boot 3.4.6 (Java 17) Backend
├── chess-frontend/         # React 19 (Vite + TS) Frontend
├── deploy/                 # Deployment & Infrastructure
│   ├── keycloak/           # Keycloak realm import (chess-realm)
│   └── monitoring/         # LGTM Stack (Loki, Prometheus, Promtail, Tempo)
├── docs/                   # Documentation & Technical Assets
│   └── assets/             # Project images and diagrams
├── .editorconfig           # Consistent coding styles across IDEs
├── .env.example            # Root environment variables template
├── .gitattributes          # Git path and text attributes
├── .gitignore              # Monorepo-wide ignore rules
├── docker-compose.yml      # Infrastructure & Monitoring orchestration
├── LICENSE                 # Project license
└── README.md               # Main project overview and entry point
```

---

## 🛠 Prerequisites

Before starting, ensure the following are installed and configured on your system to maintain a consistent development environment:

* **Container Engine:** [Docker Desktop](https://www.docker.com/) or Docker Engine with Docker Compose (Required for local Keycloak, Redis, RabbitMQ, MinIO, and PostgreSQL orchestration, and for the PostgreSQL test container).
* **Java Development Kit:** [Amazon Corretto 17](https://aws.amazon.com/corretto/) (Required for Backend)
* **Build Tool:** [Apache Maven 3.9+](https://maven.apache.org/)
* **Runtime:** [Node.js (LTS v20+)](https://nodejs.org/) - *Required for React 19 and Vite compatibility.*
* **Package Manager:** `npm` (comes with Node.js)
* **IDE:** IntelliJ IDEA (Recommended for Backend) and VS Code (Recommended for Frontend)

### 🗄️ Local Service URLs & Tooling
**DBeaver / pgAdmin 4** can be used for PostgreSQL schema visualization and manual query execution. Once the relevant Docker profiles are running, services are available at:

| Service | URL | Profile | Local default credentials |
| :--- | :--- | :--- | :--- |
| Backend API | `http://localhost:8080` | `core` | — |
| Frontend (Vite dev server) | `http://localhost:5173` | — | — |
| Frontend (container) | `http://localhost:8082` | `core` | — |
| Keycloak Admin Console | `http://localhost:8081` | `core` | `admin` / `admin` |
| RabbitMQ Management | `http://localhost:15672` | `core` | `guest` / `guest` |
| MinIO Console | `http://localhost:9001` | `storage-local` | `minioadmin` / `minioadmin` |
| Grafana | `http://localhost:3000` | `monitoring` | `admin` / `admin` |
| Prometheus | `http://localhost:9090` | `monitoring` | — |
| SonarQube | `http://localhost:9002` | `quality` | set on first login |

> Default credentials are for local development only. Override them in `.env` for any deployed environment.

---

## 📥 Getting Started

### 1. Project Initialization
Clone the repository and prepare your environment:

```bash
git clone https://github.com/BatuhanBaysal/chess-platform.git
cd chess-platform
```

Create your local `.env` configuration from the provided template:
```bash
cp .env.example .env
```

---

### 2. Backend Setup & IDE Configuration
The backend is built with Spring Boot 3.4.6 and Java 17.

#### A. IDE Settings (IntelliJ IDEA)
1. **Project SDK:** Set to **Amazon Corretto 17** in `Project Structure (Ctrl+Alt+Shift+S)`.
2. **Language Level:** Set to **"17 - Sealed types, always-strict floating point semantics"**.
3. **Maven Home:** Set to **"Bundled (Maven 3)"** in `Settings -> Build Tools -> Maven`.
4. **EnvFile Plugin:** Install the IntelliJ `EnvFile` plugin and load the root `.env` file into your Spring Boot run configuration to supply database and Keycloak credentials seamlessly.

#### B. Running Dependent Services via Docker
Before starting the backend in your IDE, start the dependent infrastructure services:

```bash
docker compose --profile core up -d db redis rabbitmq keycloak
```

To test avatar uploads and PGN exports locally, also start object storage:

```bash
docker compose --profile storage-local up -d minio
```

#### C. Build & Test Command
Integration tests need the PostgreSQL test container running first (see the [Testing Guide](TESTING.md)).

```bash
cd chess-backend
./mvnw clean install
```

---

### 3. Frontend Setup
The frontend is built with React 19, Vite, and TypeScript.

```bash
cd chess-frontend
npm install
```

---

## 🚦 Running the Application Locally

### Execution Order
Always ensure infrastructure services are healthy before starting the services.

1. **Start Core Infrastructure:**
```bash
   docker compose --profile core up -d db redis rabbitmq keycloak
```

2. **Start Backend:**
```bash
   cd chess-backend
   ./mvnw spring-boot:run
```
* **API Base URL:** `http://localhost:8080`
* **Swagger UI:** `http://localhost:8080/swagger-ui.html`
* **Actuator Health:** `http://localhost:8080/actuator/health`

3. **Start Frontend:**
```bash
   cd chess-frontend
   npm run dev
```
* **Web Client:** `http://localhost:5173`

---

## 🐳 Docker Orchestration

We utilize `docker-compose.yml` with segmented profiles to manage local dependencies and parity with production.

### 🚀 Running with Docker Compose

#### 1. Core Development Mode (Recommended)
Starts all essential services: the backend, the frontend, PostgreSQL, Redis, RabbitMQ, and Keycloak:
```bash
docker compose --profile core up -d
```

#### 2. Full Ecosystem Mode (Local Storage + Quality + Monitoring)
Starts the core stack alongside local MinIO object storage, SonarQube, and the entire LGTM monitoring stack (Loki, Grafana, Tempo, Prometheus, Promtail):
```bash
docker compose --profile core --profile storage-local --profile quality --profile monitoring up -d
```

> SonarQube alone can use up to 2 GB of memory. Start only the profiles you need.

### 🛠 Docker Management

* **Check System Status:**
```bash
docker compose ps
```

* **View Service Logs:**
```bash
# Follow logs for the backend service
docker compose logs -f backend
```

* **Stop and Clean Up:**
```bash
docker compose down
```

---

## 🤖 CI/CD Pipeline & Automated Testing

This project utilizes **GitHub Actions** defined in [**ci.yml**](../.github/workflows/ci.yml) to maintain high code quality and prevent regressions:

1. **Backend Integrity Check:**
    * Sets up **Amazon Corretto 17** with Maven dependency caching.
    * Starts PostgreSQL 15 and Redis 7 as service containers.
    * Executes `mvn clean install` to compile the code and run all unit and integration tests.

2. **Frontend Integrity Check:**
    * Sets up **Node.js v20**.
    * Runs `npm ci` for lockfile consistency and `npm run build` to verify the React production bundle.
    * Runs the **Vitest** unit/component suite (`npm test`).
    * Runs the **Playwright** end-to-end suite on Chromium.

---

## 🧪 Quality & Standards

* **Testing Strategy:** Run `./mvnw test` for the backend (start the PostgreSQL test container first) and `npm test` for the frontend. See the [**Testing Guide**](TESTING.md) for details, including the Playwright end-to-end suite.
* **Java Standards:** Sealed classes are strictly enforced for the chess piece hierarchy and records for immutable DTOs and state snapshots.
* **Workflow:** Refer to the [**Git Guide**](GIT_GUIDE.md) for branching standards and conventional commit formats.

---
*Maintained with a focus on Engineering Discipline and Scalable Design.*
