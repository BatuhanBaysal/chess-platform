# 🎨 Chess Frontend (React + TS)

![React 19](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A high-performance, reactive user interface built for real-time chess gameplay, focusing on **Type-Safe Component Architecture** and **Fluid State Synchronization**.

---

## 🚀 Frontend Strategy & Architecture
This module is designed to handle complex game states and real-time updates without compromising performance.

- **Component-Based UI:** Atomic design approach using **Tailwind CSS** for a modular, responsive, and maintainable styling system.
- **Type-Safe Game Logic:** Leveraging **TypeScript** interfaces to mirror the Backend Domain (Pieces, Moves, GameState), ensuring compile-time safety.
- **Real-time Sync:** Powered by **StompJS** and **SockJS** to maintain a persistent bidirectional connection with the Spring Boot backend.
- **State Orchestration:** Utilizing **React Hooks** and **Context API** for localized game state management, ensuring minimal re-renders during rapid board updates.

---

## 🛠️ Technical Stack
- **Bundler:** [Vite](https://vitejs.dev/) (Chosen for ultra-fast Hot Module Replacement).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first approach for rapid and consistent UI development).
- **Icons & Assets:** SVGs for chess pieces to ensure crisp rendering at any zoom level.
- **Communication:** [Axios](https://axios-http.com/) for RESTful session management & [StompJS](https://stomp-js.github.io/) for WebSockets.

---

## 📂 Directory Structure (Planned)
```text
src/
├── api/         # Axios instance and REST endpoints
├── assets/      # Optimized Piece SVGs & Sound effects
├── components/  # Atomic UI (Board, Square, Piece, MoveHistory)
├── hooks/       # Custom Logic (useChessEngine, useSocketSync)
├── services/    # WebSocket Clients & STOMP configurations
├── types/       # Global TS Interfaces (Game, User, Move)
└── utils/       # Chess coordinate helpers (e.g., a1 -> index)
```

## 🚦 Local Development
This project is built using **Node.js (LTS)** and **Vite**. Follow these steps to set up the frontend environment.

### 1. Prerequisites
- **Node.js:** v18.x or higher recommended.
- **Package Manager:** npm (comes with Node.js) or yarn.
- **Backend:** Ensure the [Chess Backend](../chess-backend/README.md) is running for full functionality.

### 2. Environment Setup
Create a `.env` file in the `chess-frontend/` directory:
```text
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

### 3. Installation & Execution
Run the following commands from the **`chess-frontend/`** directory:

```bash
# Install project dependencies
npm install

# Start the Vite development server with HMR (Hot Module Replacement)
npm run dev
```

*The application will be available at [`http://localhost:5173`](http://localhost:5173).*

### 4. Production Build
To create an optimized, minified, and production-ready build:
```bash
npm run build
```

## 📂 Engineering Focus Areas
This frontend is not just a UI; it is a high-performance state machine designed for real-time accuracy and fluid gameplay.

* **Optimized Board Rendering:** Utilizing `React.memo` and `useCallback` to ensure that only the affected squares and pieces are re-rendered during a move, keeping the 64-square board interactions fluid and lag-free.
* **Type-Safe Full-Stack Sync:** Synchronizing **TypeScript** interfaces and Enums with Backend Domain models (Pieces, Moves, GameState) to ensure total data consistency across the stack.
* **Fluid UI/UX:** A mobile-first, responsive design approach using **Tailwind CSS**, ensuring a seamless and aesthetic experience from desktop to mobile browsers.
* **Socket Resilience:** Implementation of heartbeat and auto-reconnect logic for **STOMP** sessions to ensure a persistent player experience during competitive and real-time play.

---

## ⭐ Support the Frontend Development
If you're interested in the UI/UX decisions or the state management:
1.  **Explore Components:** Check `src/components/` to see our atomic design implementation.
2.  **Review the Hooks:** See how we handle real-time logic in `src/hooks/useSocketSync.ts`.
3.  **Star the Repo:** Stay updated as we move into Phase 4 (UI Integration).

---
*Focus: Delivering a seamless, real-time user experience with modern React standards.*
