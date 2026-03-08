# ♟️ Chess Platform (Full-Stack Monorepo) ♔

![Social Preview](docs/assets/social-preview.png)

### ⚙️ Backend Stack
![Java 17](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring Boot 3.4.6](https://img.shields.io/badge/Spring_Boot-3.4.6-green?style=for-the-badge&logo=springboot&logoColor=white) ![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![H2](https://img.shields.io/badge/H2_Database-4479A1?style=for-the-badge)

### 🎨 Frontend & Tools
![React 19](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-blue?style=for-the-badge) ![Swagger/OpenAPI](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

---

**A professional, real-time chess ecosystem built with a focus on Domain-Driven Design (DDD), Clean Architecture, and Modern Java 17 standards.**

---

## 🏛️ Project Ecosystem & Governance
This is a high-cohesion monorepo. I have established a professional workflow to ensure code quality and transparency.

| Module / Document | Purpose | Key Technologies |
| :--- | :--- | :--- |
| [**⚙️ Backend**](./chess-backend/README.md) | Core Engine | Java 17, Spring Boot 3.4.6, JUnit 5 |
| [**🎨 Frontend**](./chess-frontend/README.md) | User Interface | React 19, TypeScript, Tailwind CSS |
| [**🚀 Git Guide**](./GIT_GUIDE.md) | Deployment & Workflow | **Standardized Git Flow & Commits** |
| [**📂 Documentation**](./docs/) | Schemas & Diagrams | **Refer to this for database & architecture.** |
| [**📜 Changelog**](./CHANGELOG.md) | Progress Tracking | **Check this to see my daily evolution.** |
| [**🛡️ Security**](./SECURITY.md) | Safety Protocols | Responsible Disclosure & Practices |
| [**🤝 Contributing**](./CONTRIBUTING.md) | Collaboration | Coding Standards & Git Flow |

---

## 🎯 Engineering Philosophy
While the rules of chess are centuries old, the objective of this project is to model this complexity using **High-Level Software Engineering** standards. This platform serves as a practical implementation of:

* **Advanced OOP & Design Patterns:** Beyond basic inheritance; utilizing **Strategy** for move validation, **Factory** for piece creation, and **Observer** for real-time state updates.
* **Concurrency & Thread Safety:** Handling real-time game states and WebSocket sessions with safe multi-threading practices to ensure data integrity during simultaneous moves.
* **Modern Java 17 Standards:** Deep dive into **Sealed Classes** to strictly define piece hierarchies and **Records** for immutable value objects.
* **Clean Architecture & DDD:** A "Pure Java" domain layer, completely decoupled from Spring Boot or any external framework, ensuring the core logic is 100% testable and reusable.
* **Reliability:** A TDD-ready approach supported by a dual-database strategy (PostgreSQL for persistence / H2 for lightning-fast unit testing).

---

## 🚀 Development Roadmap
*Current Status: **Phase 2: Domain Modeling***

- ✅ **Phase 1: Foundation** - Monorepo scaffolding, environment management, and database initialization.
- ⏳ **Phase 2: Domain Modeling** - Piece-specific logic, movement rules, and board representation.
- ⏳ **Phase 3: Rule Engine** - Complex validation (Checkmate, Stalemate, Castling, En Passant).
- ⏳ **Phase 4: Multi-player** - WebSocket integration and session management.
- ⏳ **Phase 5: UI Integration** - Responsive board UI and real-time state management.

---

## 🚦 Getting Started & Local Setup
**Prerequisites:** Amazon Corretto 17, Node.js (LTS), and a `.env` file in the root.

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/BatuhanBaysal/chess-platform.git

# Setup Backend
cd chess-backend && ./mvnw install

# Setup Frontend
cd chess-frontend && npm install
```

---

### 2. Running the App
* **Backend:** Run `ChessApplication.java` via IntelliJ IDEA or use the command:
    ```bash
    cd chess-backend && ./mvnw spring-boot:run
    ```
* **Frontend:** Run the development server in the frontend directory:
    ```bash
    cd chess-frontend && npm run dev
    ```

---

## ⭐ Support the Journey
If you find this project's architecture or implementation helpful, feel free to engage:
1.  **Fork** the project to experiment with the chess logic or add your own rules.
2.  Give it a **Star** to show your support and stay updated.
3.  Check the [**CHANGELOG.md**](./CHANGELOG.md) to follow my daily progress, architectural decisions, and Phase 2 updates.

---
## 👨‍💻 Developed By
**Batuhan Baysal** - *Software Developer* *Always building, always learning, and always open to feedback.*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/batuhan-baysal) [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BatuhanBaysal) [![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:batuhanbaysal3@gmail.com)

> 📧 **Direct Contact:** batuhanbaysal3@gmail.com

---
*Built with professional intent and a focus on Scalable Software Design.*
