# 🎨 Chess Frontend (React 19 + TS)

![React 19](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

A high-performance, reactive user interface built for real-time chess gameplay, focusing on **Type-Safe Component Architecture** and **Fluid State Synchronization**.

---

## 🚀 Frontend Strategy & Architecture
This module is designed to handle complex game states and real-time updates without compromising performance:

- **Atomic UI Design:** Modular and responsive styling system built with **Tailwind CSS** for a scalable component library.
- **Type-Safe Domain Mirroring:** Leveraging **TypeScript** to mirror Backend Domain models (Java Records/Sealed Classes), ensuring compile-time safety across the bridge.
- **Hook-Based Logic:** Centralized game orchestration using custom hooks (`useChess`), decoupling the board's visual representation from the underlying move validation and state logic.
- **Real-time Ready:** Architected to support **StompJS** over WebSockets, maintaining a persistent bidirectional connection with the Spring Boot engine.

---

## 🚀 Getting Started & Setup
To maintain a single source of truth, all installation and environment configuration instructions are located in the main development guide:

👉 [**Go to DEVELOPMENT.md for Setup Instructions**](../docs/DEVELOPMENT.md)

---

## 🛠️ Technical Stack
- **Bundler:** [Vite](https://vitejs.dev/) (Chosen for ultra-fast Hot Module Replacement and optimized build times).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS for rapid UI development and design consistency).
- **Icons & Assets:** Optimized SVGs for resolution-independent, high-fidelity chess pieces.
- **State Management:** React 19 State API + Custom Hooks for lightweight, high-performance logic.

---

## 📂 Directory Structure
```text
src/
├── assets/      # Optimized Piece SVGs & Media assets
├── components/  # Atomic UI Components (ChessBoard.tsx, Square, etc.)
├── hooks/       # Custom Business Logic (useChess.ts for engine sync)
├── App.tsx      # Main application orchestrator
├── main.tsx     # React DOM entry point
└── index.css    # Tailwind directives & global styles
```

## 🧪 Engineering Focus Areas
This frontend is architected as a high-performance state machine, designed for real-time accuracy and fluid gameplay:

* **Hook-Based Logic Orchestration:** By centralizing the game engine logic within the `useChess.ts` custom hook, we achieve a clean separation of concerns. This allows the UI components to remain "dumb" and focus purely on rendering, while the hook manages complex move validation, turn switching, and state synchronization.
* **Optimized Board Rendering:** We utilize React 19's rendering optimization strategies (such as `memo` and selective state updates) to ensure that only the affected squares (e.g., source and target squares of a move) are re-rendered. This keeps the 64-square board interactions fluid and lag-free.
* **Full-Stack Type Integrity:** We maintain strict synchronization between **TypeScript** interfaces and Backend Domain models (Java Records). This ensures total data consistency and prevents runtime errors when receiving complex game state snapshots over the bridge.
* **Atomic Component Architecture:** By breaking the UI into small, reusable components (Square -> Piece -> ChessBoard), we ensure the codebase remains maintainable. This structure is specifically designed to easily integrate future features like move history, captured piece displays, and promotion modals.
* **Responsive Fluidity:** A mobile-first, responsive design approach using **Tailwind CSS**, ensuring a seamless and aesthetic experience across all screen sizes from large desktop monitors to mobile browsers.

---
*Focus: Delivering a seamless, real-time user experience with modern React standards.*
