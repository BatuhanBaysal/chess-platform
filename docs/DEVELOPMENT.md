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
├── docs/                   # Documentation & Technical Assets (This Folder)
│   ├── api-specs/          # OpenAPI/Swagger schemas and API docs
│   ├── assets/             # Project images and diagrams
│   └── sql/                # Manual SQL scripts and schema migrations
├── .editorconfig           # Consistent coding styles across IDEs
├── .env.example            # Root environment variables template
├── .gitattributes          # Git path and text attributes
├── .gitignore              # Monorepo-wide ignore rules
├── LICENSE                 # Project license
└── README.md               # Main project overview and entry point
```

---

## 🛠 Prerequisites

Before starting, ensure the following are installed and configured on your system to maintain a consistent development environment:

* **Java Development Kit:** [Amazon Corretto 17](https://aws.amazon.com/corretto/) (Required for Backend)
* **Build Tool:** [Apache Maven 3.9+](https://maven.apache.org/)
* **Runtime:** [Node.js (LTS v20+)](https://nodejs.org/) - *Required for React 19 and Vite compatibility.*
* **Package Manager:** `npm` (comes with Node.js)
* **Database Server:** [PostgreSQL](https://www.postgresql.org/) (Local instance for data persistence)
* **IDE:** IntelliJ IDEA (Recommended for Backend) and VS Code (Recommended for Frontend)

### 🗄️ Database Management Tools
We utilize professional tooling for schema design, administration, and manual query execution:
* **pgAdmin 4:** Primarily used for PostgreSQL server administration and initial database creation.
* **DBeaver:** Primary SQL IDE used for advanced schema visualization, complex query execution, and manual data manipulation.

---

## 📥 Getting Started

### 1. Project Initialization
You can either clone the existing repository or understand the initialization process:

* **To Clone:**
```bash
  git clone [https://github.com/BatuhanBaysal/chess-platform.git](https://github.com/BatuhanBaysal/chess-platform.git)
  cd chess-platform
```

* **To Initialize from Scratch:**
  If you are recreating this environment, initialize a **Git Monorepo** and ensure your `.gitignore` excludes both Maven (`target/`, `.mvn/`) and Node (`node_modules/`, `dist/`) build artifacts.

---

### 2. Backend Setup & IDE Configuration
The backend is built with Spring Boot 3.4.6. Specific IDE settings are mandatory to support Java 17 features like **Sealed Classes**:

#### A. IDE Settings (IntelliJ IDEA)
1. **Project SDK:** Set to **Amazon Corretto 17** in `Project Structure (Ctrl+Alt+Shift+S)`.
2. **Language Level:** Set to **"17 - Sealed types, always-strict floating point semantics"**. Without this, the piece hierarchy logic will not compile.
3. **Maven Home:** Set to **"Bundled (Maven 3)"** in `Settings -> Build Tools -> Maven` to ensure compatibility with the project's build lifecycle.

#### B. Database Preparation
1. Open **pgAdmin 4** and create a new database named `chess_db`.
2. Use **DBeaver** to connect to your local PostgreSQL instance and verify the connection.
3. **Environment Configuration:**
    * Locate the `.env.example` file in the **root directory**.
    * Create a copy named `.env` in the same **root directory**.
    * Fill in your local credentials (`CHESS_DB_URL`, `CHESS_DB_USERNAME`, `CHESS_DB_PASSWORD`).
    * *Note: The application is configured to read these variables from the root during runtime.*

#### C. Spring Profiles & Logic
The application manages environments through profiles:
* **`dev` (Default):** Connects to your local **PostgreSQL** using the root `.env` credentials.
* **`test`:** Automatically activated during `./mvnw test`. It uses an **H2 In-memory database** for isolated and side-effect-free testing.

#### D. Build Command
```bash
cd chess-backend
./mvnw clean install
```

### 3. Frontend Setup
The frontend is a modern React 19 application built with **Vite** and **TypeScript**.

#### A. Initial Setup (Manual or Cloned)
To install the necessary dependencies and initialize the environment:
```bash
cd chess-frontend
npm install
```

#### B. Manual Initialization (If from Scratch)
If you are recreating the frontend folder independently:
1. Run the Vite initialization command: `npm create vite@latest chess-frontend -- --template react-ts`
2. Follow the Tailwind CSS integration guide to set up `tailwind.config.js` and `postcss.config.js`.

---

## 🚦 Running the Application

### Execution Order
To ensure the full-stack ecosystem functions correctly, always start the Backend first. This allows the WebSocket server and API endpoints to be available before the UI attempts to establish a connection.

1. **Start Backend:**
```bash
   cd chess-backend
   ./mvnw spring-boot:run
```

* **API Base URL:** `http://localhost:8080`
* **Swagger UI:** `http://localhost:8080/swagger-ui.html` (Use this for API exploration and manual testing)

2. **Start Frontend:**
```bash
   cd chess-frontend
   npm run dev
```
* **Web URL:** `http://localhost:5173`
    * **Real-time Engine:** Game state synchronization is managed via STOMP over WebSockets.

---

## 🤖 CI/CD Pipeline & Automated Testing

This project utilizes **GitHub Actions** to maintain high code quality and ensure a regression-free development environment.

### 🛡️ Continuous Integration (CI)
Every time a commit is pushed or a Pull Request is opened, the project’s digital guardian—defined in [**ci.yml**](../.github/workflows/ci.yml)—automatically triggers:

1.  **Backend Integrity Check:**
    * Sets up **Amazon Corretto 17**.
    * Executes `mvn clean install` to ensure the Spring Boot application compiles and all unit tests pass.
    * Uses Maven caching to optimize build times.

2.  **Frontend Integrity Check:**
    * Sets up **Node.js v20**.
    * Executes `npm ci` for a clean, lock-file-consistent installation.
    * Runs `npm run build` to verify the React production bundle.

### 🚦 Why This Matters?
* **Early Failure:** Catching syntax or logic errors before they reach the `main` branch.
* **Clean Build Guarantee:** Ensures the project is not "machine-dependent" and runs perfectly on a standard Linux environment.
* **Automated Testing:** Validates that new features (e.g., a new Piece move) do not break existing chess rules.

---

## 🧪 Quality & Standards

* **Testing Strategy:** Run `./mvnw test` for the Backend. We utilize an **H2 In-memory database** for automated testing to ensure a "side-effect free" environment that does not interfere with your local PostgreSQL data.
* **Java Standards:** We strictly utilize **Sealed Classes** for the piece hierarchy and **Records** for immutable Data Transfer Objects (DTOs), ensuring modern, type-safe, and clean code.
* **Workflow:** Refer to the [**Git Guide**](../.github/GIT_GUIDE.md) for detailed information on branching strategy and commit conventions before pushing any changes.

---
*Maintained with a focus on Engineering Discipline and Scalable Design.*
