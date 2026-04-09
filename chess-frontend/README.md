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
- **Bundler:** [Vite](https://vitejs.dev/) - Selected for ultra-fast Hot Module Replacement (HMR) and an optimized Rollup-based build pipeline.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first approach used to implement a consistent, design-system-oriented UI with full Dark/Light mode support.
- **Assets:** Optimized high-fidelity SVGs for pieces, hosted locally to ensure resolution-independent rendering and zero external latency.
- **State Management:** React 19 Context & Hooks API - Utilized for lightweight, high-performance logic management without the overhead of external state libraries.

---

## 📂 Directory Structure
```text
src/
├── api/         # Infrastructure Layer: API clients (Axios) & Service definitions
├── assets/      # Media Gallery: Specialized piece SVGs, backgrounds & brand assets
├── components/  # Atomic UI Components: Modular React 19 units (ChessBoard, AuthCard, Piece)
├── hooks/       # Custom Business Logic: Engine synchronization & Auth state management
├── App.tsx      # Application Root: Global routing and context orchestration
├── main.tsx     # React DOM entry point and strict mode initialization
└── index.css    # Global styling: Tailwind CSS directives & theme variables
```

## 🧪 Engineering Focus Areas
This frontend is architected as a high-performance state machine, designed for real-time accuracy and fluid gameplay:

* **Engine Synchronization (useChess):** The `useChess.ts` custom hook acts as the bridge between the UI and the Backend Rule Engine. It orchestrates real-time WebSocket events and local optimistic updates while maintaining strict state synchronization with the **Server-Side Authority**.
* **Identity & Access Management:** With the implementation of **Phase 7**, the frontend now manages secure session persistence via **JWT**. The `AuthCard` and dedicated auth hooks ensure that user identity is consistently injected into the API layer for authenticated gameplay.
* **Component-Level Rendering Optimization:** We leverage React 19's optimized rendering cycle to ensure that only the affected squares of the 64-tile grid are updated during a move. This results in fluid, sub-millisecond board interactions.
* **Full-Stack Type Integrity:** Strict synchronization is maintained between **TypeScript** interfaces and Backend Java Records. This "Domain Mirroring" ensures total data consistency and provides compile-time protection when processing complex server-side state snapshots.
* **Atomic Component Philosophy:** The UI is decomposed into small, reusable units (Square -> Piece -> MoveLog). This modularity allowed for the rapid integration of complex features like the **Promotion Modal** and **Live Operations Log** without breaking the core board architecture.

---
*Focus: Delivering a seamless, real-time user experience with modern React standards.*
