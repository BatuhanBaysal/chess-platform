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
* **Issue Templates:** Please use our pre-defined templates for better tracking:
    * For bugs, use [bug_report.md](../.github/ISSUE_TEMPLATE/bug_report.md).
    * For new features, use [feature_request.md](../.github/ISSUE_TEMPLATE/feature_request.md).
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
6. **Pull Request Template:** When opening a PR, ensure you follow the structure defined in [pull_request_template.md](../.github/pull_request_template.md).

---

## 📋 Project Management & Workflow

### 1. Issue Lifecycle
All work starts with an **Issue**.
* **Creation:** Before starting any code changes, open an issue detailing the bug or feature request.
* **Milestones:** All issues must be assigned to the appropriate **Milestone** (e.g., v1.0, v1.1) to track progress towards releases.
* **Labels:** Apply relevant labels to categorize your task.

### 2. Pull Request (PR) Strategy
We link PRs to Issues to ensure traceability.
* **Linked Issues:** Every Pull Request must address a specific issue. Use the following keyword in your PR description: `Closes #<issue-number>`
* **Atomic PRs:** Keep your PRs small and focused on a single issue.

### 3. Review Process
* Before merging, all PRs require:
    * Passing status of all CI/CD workflows defined in [ci.yml](../.github/workflows/ci.yml).
    * Verification that all related unit tests are passing.
    * A clean commit history (Squashed if necessary).

---

## 🛠️ Technical Baseline
* **Backend:** Java 17 (Amazon Corretto) & Spring Boot 3.4.6.
* **Frontend:** React 19 (Vite) & TypeScript.
* **Environment:** Refer to the [**Setup Guide**](DEVELOPMENT.md) to get your local environment running.

### 💬 Need Help?
If you have questions about architectural decisions or need clarification on a task, please feel free to:
* **Open a Discussion:** Use the [GitHub Discussions](https://github.com/BatuhanBaysal/chess-platform/discussions) section for non-bug-related architectural queries.
* **Tag for Review:** If you're a new contributor, feel free to tag the maintainers in the PR comments for guidance.

---
*By contributing, you agree that your contributions will be licensed under the [**MIT License**](../LICENSE).*
