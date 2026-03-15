# 🛡️ Security Policy

I am committed to maintaining the security and integrity of the **Chess Platform**. This document outlines our supported versions and the responsible disclosure process for reporting vulnerabilities.

---

## 📅 Supported Versions

Currently, security updates and patches are focused on the latest development branch.

| Version | Supported          | Status             |
| :---    | :---:              | :---               |
| **Current (Main)** | ✅ Supported       | Active Development |
| < 1.0.0           | ❌ Not Supported   | Alpha/Beta Phase   |

---

## 🚀 Reporting a Vulnerability

If you discover a potential security flaw, **please do not open a public issue.** Responsible disclosure is key to protecting the platform's integrity.

1.  **Direct Contact:** Send a detailed report to **batuhanbaysal3@gmail.com**.
2.  **Required Information:**
    * A clear description of the vulnerability.
    * Step-by-step instructions to reproduce (Proof of Concept).
    * Assessment of the potential impact.
3.  **My Commitment:** I will acknowledge your report within **48 hours** and provide a timeline for a fix.

---

## 🔒 Proactive Security Standards
This project implements the following security measures to ensure a safe environment:

* **Secret Management:** Sensitive credentials (DB, Tokens) are managed via environment variables and the [`.env.example`](../.env.example) template. Actual secrets are **never** committed to version control.
* **Backend Security:** Utilizing **Spring Security** for robust authentication, authorization, and CSRF protection.
* **WebSocket Safety:** Implementing secure **STOMP** communication with channel interceptors to prevent unauthorized move injections or session hijacking.
* **Data Integrity:** Strict server-side validation using **JSR 380 (Bean Validation)** to prevent injection attacks and ensure business rule compliance.
* **Dependency Audits:** Utilizing automated tools (e.g., GitHub Dependabot) to monitor and patch vulnerabilities in Maven and NPM packages.

---
*Thank you for helping keep the Chess Platform secure!*
