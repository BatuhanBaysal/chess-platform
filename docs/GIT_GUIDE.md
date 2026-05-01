# 🚀 Git & GitHub Deployment Guide

This guide outlines the essential Git workflows and best practices to maintain version control integrity for the **Chess Platform** project.

---

## 1. GitHub Connection & Authentication
Before your first push, ensure Git knows who you are:

* **Identity Configuration:**
    ```bash
    git config --global user.name "your-username"
    git config --global user.email "your-email"
    ```
* **Connection Check:**
    ```bash
    # If using SSH:
    ssh -T git@github.com
    
    # If using HTTPS:
    # A 'Sign in' window will appear during your first push.
    ```

---

## 2. Initializing a New Project (Initial Push)
Follow these steps to link a local project to a new GitHub repository for the first time.

### Step 0: Create the Remote Repository
1. Log in to your GitHub account and click **"New repository"**.
2. Enter your desired **Repository Name**.
3. **IMPORTANT:** Do **NOT** initialize the repository with a README, .gitignore, or License on GitHub if you have already created these files locally. The repository must be completely empty to avoid merge conflicts during the initial push.
4. Click **"Create repository"** to obtain your remote URL.

### Step 1: Link and Push Local Files
Standard terminal workflow to initialize Git and perform the first push:

```bash
# 1. Navigate to your project directory
cd "C:/path/to/your-project"

# 2. Initialize Git and stage all files
git init
git add .

# 3. Create the initial snapshot (Commit)
git commit -m "feat: initial commit with project scaffolding"

# 4. Set the primary branch to 'main' and link the remote repository
git branch -M main
git remote add origin https://github.com/username/repository-name.git

# 5. Push files and track the remote branch
git push -u origin main
```

---

## 3. Daily Workflow (The Push Process)
Once the repository is established, follow this 3-step cycle for every change:

1.  **Stage (Add):** Select your changes.
    * `git add .` (Add all changes)
    * `git add filename.java` (Add a specific file only)
2.  **Commit:** Seal your changes with a descriptive message.
    * `git commit -m "docs: update readme with architectural diagrams"`
3.  **Push:** Upload your local commits to the cloud.
    * `git push`

---

## 4. Monitoring & Verification (Log & Status)
Use these commands to ensure your workspace is synchronized:

* **Status Check:** `git status` (Displays modified, deleted, or untracked files.)
* **View History:** `git log --oneline` (Lists recent commits in a concise, single-line format.)
* **Remote Check:** `git remote -v` (Verifies the linked GitHub repository URL.)

---

## 5. Essential Commands (Quick Reference)

| Command | Description |
| :--- | :--- |
| `git clone <url>` | Clones an existing repository to your local machine. |
| `git pull` | Fetches and merges the latest changes from the remote server. |
| `git checkout -b <branch>` | Creates a new branch and switches to it immediately. |
| `git merge <branch>` | Integrates changes from the specified branch into your current branch. |
| `git reset --soft HEAD~1` | Reverts the last commit while keeping your code changes intact. |
| `git clean -fd` | Deletes all untracked files and directories from your workspace. |

---

## 6. Commit Message Standards (Conventional Commits)
To keep the project history clean and readable, we follow the **Conventional Commits** specification. This allows for automated changelogs and better team collaboration.

| Prefix | Category | Example |
| :--- | :--- | :--- |
| **feat:** | A new feature for the user | `feat: add knight movement validation` |
| **fix:** | A bug fix | `fix: resolve coordinate system overflow` |
| **docs:** | Documentation changes only | `docs: update git guide links` |
| **style:** | Formatting, missing semi-colons (no code change) | `style: apply editorconfig rules` |
| **refactor:** | Code change that neither fixes a bug nor adds a feature | `refactor: simplify piece factory logic` |
| **test:** | Adding or correcting tests | `test: add unit tests for pawn promotion` |
| **chore:** | Maintenance tasks (build tools, config, etc.) | `chore: update maven dependencies` |

---

## 7. Pro Tips for a Clean Workspace
* **Atomic Commits:** Focus on one logical change per commit. Avoid "mega-commits" that combine unrelated changes.
* **Verify Status:** Always run `git status` before `git add .` to ensure you are not accidentally staging sensitive files like `.env`.
* **Pull Regularly:** Always run `git pull` before you start working to ensure your local environment is up-to-date with the remote server.
* **Line Endings:** Our project uses `LF` (Unix-style) line endings as defined in [`.gitattributes`](../.gitattributes).

---

## 8. Advanced Branching & Clean History
We follow a strict **Feature Branch Workflow** to ensure the stability of the `main` branch.

### Branching Strategy
* **Naming Convention:** Use descriptive prefixes for all new branches:
    - `feature/` (new logic), `bugfix/` (fixing issues), `refactor/` (code cleanup), `docs/` (documentation).
* **Isolation:** 
```bash
  git checkout -b feature/pawn-en-passant
```

* **Isolation:** Never push directly to `main` for complex features. Each task should live in its own branch until it passes all local tests and validation.
* **The Goal:** The `main` branch must always remain "deployable" and stable. Never merge broken or untested code into the primary history.

### Commits & Squashing
* **Maintain a Clean History:** If you have multiple "fix typo" or "WIP" (Work In Progress) commits in your feature branch, it is highly recommended to **squash** them into a single, meaningful commit before merging.
* **Traceability:** Ensure your branch name and commit messages align with the evolution steps documented in the [**CHANGELOG.md**](CHANGELOG.md).

---

## 9. Final Checklist Before Pushing
Before sending your code to the remote repository, perform this "Flight Check" to ensure high-quality standards:

* [ ] **Status Audit:** Run `git status` to check for unintended or untracked files.
* [ ] **Secret Management:** Double-check that sensitive data in `.env` is ignored and not accidentally staged.
* [ ] **Code Formatting:** Ensure your code follows the project's [`.editorconfig`](../.editorconfig) rules.
* [ ] **Green Build:** Run local tests (`./mvnw test` or `npm test`) to ensure a regression-free build.
* [ ] **Convention Check:** Does your commit message strictly follow the `type: description` format?

---
*This document serves as a supplementary guide to [**CONTRIBUTING.md**](CONTRIBUTING.md) and [**DEVELOPMENT.md**](DEVELOPMENT.md).*
