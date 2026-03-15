# 🎨 Chess Frontend (React 19 + TS)

![React 19](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

A high-performance, reactive user interface built for real-time chess gameplay, focusing on **Type-Safe Component Architecture** and **Fluid State Synchronization**.

---

## 🚀 Frontend Strategy & Architecture
This module is designed to handle complex game states and real-time updates without compromising performance:

- **Atomic Design UI:** Modular and responsive styling system built with **Tailwind CSS** for a scalable component library.
- **Type-Safe Domain Mirroring:** Leveraging **TypeScript** to mirror Backend Domain models (Java Records/Sealed Classes), ensuring compile-time safety across the WebSocket bridge.
- **Real-time Synchronization:** Powered by **StompJS** over WebSockets to maintain a persistent bidirectional connection with the Spring Boot engine.
- **State Orchestration:** Utilizing **React Hooks** and **Context API** for localized game state management, ensuring minimal re-renders during rapid board updates.

---

## 🚀 Getting Started & Setup
To maintain a single source of truth, all installation and environment configuration instructions are located in the main development guide:

👉 [**Go to DEVELOPMENT.md for Setup Instructions**](../docs/DEVELOPMENT.md)

---

## 🛠️ Technical Stack
- **Bundler:** [Vite](https://vitejs.dev/) (Chosen for ultra-fast Hot Module Replacement and optimized build times).
- **Communication:** [Axios](https://axios-http.com/) for RESTful sessions & [StompJS](https://stomp-js.github.io/) for WebSockets.
- **Icons & Assets:** Optimized SVGs for crisp, resolution-independent chess pieces.
- **State Management:** React Context API + Custom Hooks for lightweight, high-performance logic.

---

## 📂 Directory Structure (Planned)
```text
src/
├── api/         # Axios instance and REST endpoint definitions
├── assets/      # Optimized Piece SVGs & Media assets
├── components/  # Atomic UI (Atoms, Molecules, Organisms)
├── hooks/       # Custom Logic (useChessEngine, useSocketSync)
├── services/    # WebSocket Clients & STOMP configurations
├── types/       # Global TS Interfaces (Mirroring Backend Records)
└── utils/       # Chess coordinate helpers and game math
```

## 🧪 Engineering Focus Areas
This frontend is architected as a high-performance state machine, designed for real-time accuracy and fluid gameplay:

* **Optimized Board Rendering:** We utilize `React.memo`, `useMemo`, and `useCallback` strategies to ensure that only the affected squares (e.g., source and target squares of a move) are re-rendered. This keeps the 64-square board interactions fluid and lag-free even on lower-end devices.
* **Full-Stack Type Integrity:** We maintain strict synchronization between **TypeScript** interfaces and Backend Domain models (Java Records/Sealed Classes). This ensures total data consistency and prevents runtime errors across the WebSocket bridge.
* **Socket Resilience:** Implementation of heartbeat signals and auto-reconnect logic for **STOMP** sessions ensures a persistent and reliable player experience, even during minor network fluctuations.
* **Responsive Fluidity:** A mobile-first, responsive design approach using **Tailwind CSS**, ensuring a seamless and aesthetic experience across all screen sizes from desktop monitors to mobile browsers.
* **Atomic Component Architecture:** By breaking the UI into small, reusable atoms (Square -> Piece -> Board), we ensure the codebase remains maintainable and easily testable as we add complex features like move history and captured piece displays.

---
*Focus: Delivering a seamless, real-time user experience with modern React standards.*
