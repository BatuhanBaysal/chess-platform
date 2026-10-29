# 🤝 Contributing to Chess Platform

First off, thank you for considering contributing! This project is built with high engineering standards, and we value contributions that maintain architectural purity, code clarity, and test coverage.

## 🌟 Support the Project
Not a coder? You can still support development:
* **Star the Repository:** Helps increase project visibility.
* **Spread the Word:** Share the project with developers interested in Java 17, React 19, or Hexagonal Architecture.

---

## 🚀 How Can I Contribute?

### 1. Reporting Bugs & Enhancements
* **Search First:** Check the [Issues](https://github.com/BatuhanBaysal/chess-platform/issues) tab to see if your topic is already discussed.
* **Issue Templates:** Use our pre-defined templates:
    * For bugs, use [bug_report.md](../.github/ISSUE_TEMPLATE/bug_report.md).
    * For new features, use [feature_request.md](../.github/ISSUE_TEMPLATE/feature_request.md).
* **Be Specific:** Include clear steps to reproduce, environment details, and terminal/browser logs.

### 2. Pull Request Process
To maintain our **Hexagonal Architecture** and **Domain-Driven Design (DDD)** standards:

1. **Fork & Branch:** Create a branch from `main`. Use descriptive naming:
    * `feature/pawn-en-passant`
    * `fix/timer-timeout-race`
    * `refactor/sealed-piece-hierarchy`
2. **Standard Alignment:**
    * **Backend:** Adhere to **Sealed Classes**, immutable records, and Hexagonal layer isolation (zero DB/framework leakage into the domain).
    * **Frontend:** Maintain atomic component design, strict TypeScript typing, and AAA test discipline.
    * **Formatting:** Adhere to rules defined in [`.editorconfig`](../.editorconfig).
3. **Commit Standards:** Follow the **Conventional Commits** specification:
    * Format: `feat(scope): description`, `fix(scope): description`, `test(scope): description`.
4. **Validation:**
    * Backend: Run `./mvnw clean test` (requires local Docker daemon for Testcontainers).
    * Frontend: Run `npm test` and `npm run build` to verify the bundle.
5. **Documentation:** If modifying endpoints or domain logic, update relevant Markdown guides in `docs/` or `README.md`.
6. **PR Template:** Follow the structure defined in [pull_request_template.md](../.github/pull_request_template.md) and link the issue using `Closes #<issue-number>`.

---

## 📋 Technical Baseline & References

* **Backend Engine:** Java 17 (Amazon Corretto / Temurin) & Spring Boot 3.4.6.
* **Frontend Client:** React 19 (Vite) & TypeScript.
* **Local Setup Guide:** Refer to [**DEVELOPMENT.md**](DEVELOPMENT.md) for local container orchestration.
* **Testing Specifications:** Refer to [**TESTING.md**](TESTING.md) for test execution and mock boundaries.

### 💬 Need Help?
* **Discussions:** Use [GitHub Discussions](https://github.com/BatuhanBaysal/chess-platform/discussions) for non-bug architectural questions.
* **Review Tagging:** Feel free to tag maintainers in your PR comments for architectural guidance.

---
*By contributing, you agree that your contributions will be licensed under the [**MIT License**](../LICENSE).*
