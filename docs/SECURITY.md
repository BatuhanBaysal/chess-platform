# 🛡️ Security Policy

We are committed to maintaining the security, integrity, and resilience of the **Chess Platform**. This document outlines our supported versions and the responsible disclosure process for reporting vulnerabilities.

---

## 📅 Supported Versions

Security patches and dependency updates are applied to the active `main` branch.

| Version | Supported | Status |
| :--- | :---: | :--- |
| **Current (`main`)** | ✅ Supported | Active Development |
| `< 1.0.0` | ❌ Not Supported | Legacy Iterations |

---

## 🚀 Reporting a Vulnerability

If you discover a potential security vulnerability, **please do not open a public GitHub issue.** Responsible disclosure is critical to protecting active deployments and user data.

1. **Direct Contact:** Send a report directly to **batuhanbaysal3@gmail.com**.
2. **Required Details:**
    * Description of the vulnerability and affected component (Backend, Keycloak IAM, or Frontend).
    * Step-by-step instructions or proof-of-concept payload to reproduce the flaw.
    * Assessment of the potential impact (e.g. privilege escalation, session hijacking, denial of service).
3. **Commitment:** We will acknowledge receipt within **48 hours** and provide a structured timeline for investigation and mitigation.

---

## 🔒 Proactive Security Architecture

The platform incorporates multi-layered defense mechanisms:

* **Stateless IAM & OAuth2/OIDC:** Authentication is delegated to **Keycloak**, validating asymmetric JWT signatures via JWK Set endpoints (`certs`) with transitive Role-Based Access Control (`ROLE_ADMIN > ROLE_USER > ROLE_GUEST`).
* **Secret Hygiene:** Database passwords, client secrets, and storage keys are managed strictly via environment variables and [`.env.example`](../.env.example). No credentials are committed to version control.
* **Rate Limiting & DoS Protection:** Sensitive endpoints (`/api/auth/**`, `/api/games/vs-ai`, `/api/lobby/create`) are protected by **Resilience4j RateLimiters** returning HTTP `429 Too Many Requests` on breach.
* **Real-Time WebSocket Authorization:** STOMP channels enforce connection verification, user-specific destination prefixes (`/queue/errors`), and server-authoritative move validation to prevent injection or state tampering.
* **Input Validation & Sanitization:** Strict request validation enforced at the controller layer via **Jakarta Bean Validation (JSR 380)** using immutable record types.
* **Audit Logging:** Administrative actions are transparently captured via Spring AOP (`@AuditableAction`) and persisted into an isolated audit log table.
* **Automated Dependency Scans:** Regular scans using Dependabot and SonarQube to identify Common Vulnerabilities and Exposures (CVEs).

---
*Thank you for helping keep the Chess Platform safe and reliable!*
