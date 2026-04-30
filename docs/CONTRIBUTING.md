# 🤝 Contributing to Chess Platform

First off, thank you for considering contributing! This project is built with high engineering standards, and we value contributions that maintain this level of quality.

## 🌟 Support the Project
Not a coder? No problem! You can still support the development:
* **Star the Repository:** It helps increase the project's visibility and motivates the community.
* **Spread the Word:** Share the project with other developers interested in Java 17, React 19, or DDD.

---

## 🚀 How Can I Contribute?

### 1. Reporting Bugs & Enhancements
* **Search First:** Check the [Issues](https://github.com/BatuhanBaysal/chess-platform/issues) tab to see if your topic is already being discussed.
* **Be Specific:** For bugs, include steps to reproduce, environment details, and screenshots if possible.

### 2. Pull Request Process
To maintain our **Hexagonal Architecture** and **DDD** principles, please follow this workflow:

1. **Fork & Branch:** Create a branch from `main`. Use naming conventions: `feature/xyz`, `fix/xyz`, or `refactor/xyz`.
2. **Standard Alignment:** * **Backend:** Adhere to **Sealed Classes** hierarchy and **Domain Purity**.
    * **Frontend:** Use **Atomic Components** and ensure **Type-Safety**.
    * **General:** Follow the [`.editorconfig`](../.editorconfig) rules for code styling.
3. **Commit Standards:** We follow strict commit naming. Please refer to our [**Git Guide**](GIT_GUIDE.md) before committing.
4. **Validation:**
    * Backend: Run `./mvnw test` (Must pass 100%).
    * Frontend: Run `npm run lint` and ensure the build succeeds.
5. **Documentation:** If you add a feature, update the relevant `README.md` or files in the `docs/` folder.

---

## 🛠️ Technical Baseline
* **Backend:** Java 17 (Amazon Corretto) & Spring Boot 3.4.6.
* **Frontend:** React 19 (Vite) & TypeScript.
* **Environment:** Refer to the [**Setup Guide**](./DEVELOPMENT.md) to get your local environment running.

---
*By contributing, you agree that your contributions will be licensed under the [**MIT License**](../LICENSE).*
