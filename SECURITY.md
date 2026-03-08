# 🛡️ Security Policy

I take the security of the **Chess Platform** seriously. This document outlines the supported versions and the process for reporting any security vulnerabilities found within the project.

---

## 📅 Supported Versions

As this is an actively developed project, security updates and patches are primarily focused on the latest release.

| Version | Supported          | Status             |
| :---    | :---:              | :---               |
| **Latest** | ✅ Supported       | Active Development |
| < Latest | ❌ Not Supported   | End of Life (EOL)  |

---

## 🚀 Reporting a Vulnerability

If you discover a potential security vulnerability, **please do not open a public issue.** Public disclosure before a fix is available puts all users at risk.

Instead, please follow these steps to report the issue responsibly:

1.  **Direct Contact:** Send a detailed email to **batuhanbaysal3@gmail.com**.
2.  **Details to Include:**
    * A description of the vulnerability.
    * Steps to reproduce the issue (PoC).
    * Potential impact of the vulnerability.
3.  **Response Time:** I will acknowledge your report within **48 hours** and work towards a resolution as quickly as possible.

---

## 🔒 Security Best Practices in this Project
* **Environment Variables:** Sensitive data is managed via [`.env.example`](./.env.example) and never hardcoded.
* **Dependency Audits:** Regular checks on Maven and NPM dependencies for known vulnerabilities.
* **Sanitization:** Robust input validation via **JSR 380** on the [**Backend**](./chess-backend/).

---
*Thank you for helping keep this project secure and maintaining the integrity of the platform!*
