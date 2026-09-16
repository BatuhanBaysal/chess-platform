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

* **Container Engine:** [Docker Desktop](https://www.docker.com/) or Docker Engine with Docker Compose (Required for local Keycloak, Redis, MinIO, and PostgreSQL orchestration).
* **Java Development Kit:** [Amazon Corretto 17](https://aws.amazon.com/corretto/) (Required for Backend)
* **Build Tool:** [Apache Maven 3.9+](https://maven.apache.org/)
* **Runtime:** [Node.js (LTS v20+)](https://nodejs.org/) - *Required for React 19 and Vite compatibility.*
* **Package Manager:** `npm` (comes with Node.js)
* **IDE:** IntelliJ IDEA (Recommended for Backend) and VS Code (Recommended for Frontend)

### 🗄️ Database & Tooling
* **DBeaver / pgAdmin 4:** Used for PostgreSQL schema visualization and manual query execution.
* **MinIO Console:** Accessible locally at `http://localhost:9001` (`minioadmin:minioadmin`) for inspecting avatar artifacts and S3 bucket structures.
* **Keycloak Admin Console:** Accessible locally at `http://localhost:8081` (`admin:admin`) for managing users, roles, and client credentials.

---

## 📥 Getting Started

### 1. Project Initialization
Clone the repository and prepare your environment:

```bash
git clone [https://github.com/BatuhanBaysal/chess-platform.git](https://github.com/BatuhanBaysal/chess-platform.git)
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
docker compose --profile core up -d db redis keycloak
```

#### C. Build & Test Command
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
   docker compose --profile core up -d db redis keycloak
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
Starts all essential services including the App container, PostgreSQL, Redis, and Keycloak:
```bash
docker compose --profile core up -d
```

#### 2. Full Ecosystem Mode (Local Storage + Monitoring)
Starts the core stack alongside local MinIO object storage and the entire LGTM monitoring stack (Loki, Grafana, Tempo, Prometheus, Promtail):
```bash
docker compose --profile core --profile storage-local --profile monitoring up -d
```

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
    * Sets up **Amazon Corretto 17**.
    * Executes `mvn clean install` to ensure code compiles and all unit/integration tests pass.
    * Utilizes Maven dependency caching to optimize execution times.

2. **Frontend Integrity Check:**
    * Sets up **Node.js v20**.
    * Runs `npm ci` for lockfile consistency.
    * Executes `npm run build` to verify the React production bundle.

---

## 🧪 Quality & Standards

* **Testing Strategy:** Run `./mvnw test` for the backend. We use an **H2 In-memory database** for automated testing to ensure a side-effect-free test lifecycle without modifying local databases.
* **Java Standards:** Sealed classes are strictly enforced for the chess piece hierarchy and records for immutable DTOs and state snapshots.
* **Workflow:** Refer to the [**Git Guide**](GIT_GUIDE.md) for branching standards and conventional commit formats.

---
*Maintained with a focus on Engineering Discipline and Scalable Design.*
