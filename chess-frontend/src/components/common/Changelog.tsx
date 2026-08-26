import React from 'react';

const releases = [
  {
    version: 'v2.1.0',
    date: '2026-08-25',
    title: 'Phase 20: Core Domain Modeling & Piece Logic',
    description: 'Completion of all individual piece movement rules, board initialization, and the central game orchestrator.',
    features: [
      'Game Orchestration: Implemented Game.java as the central domain orchestrator for turn management, move execution, and game lifecycle.',
      'King & Queen Implementation: Finalized king/queen validation logic and sliding diagonal/linear movement patterns.',
      'Rook, Bishop, Knight & Pawn Implementation: Comprehensive validation for orthogonal, diagonal, L-move, and double-step initial conditional capturing.'
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-08-14',
    title: 'Phase 19: AI Integration & Training Ecosystem',
    description: 'Expanding the training ecosystem with automated computer opponent capabilities powered by the Stockfish chess engine.',
    features: [
      'Stockfish Real-Time Telemetry & Performance Optimization with throttled broadcasting.',
      'Engine Evaluation, Hints & Move Quality Tagging with automated blunder, mistake, and inaccuracy indicators.',
      'Play vs AI Time Control & Enhancements supporting 3, 10, or 30 minutes with graceful resignation options.',
      'Bundled Stockfish binary directly into backend resources for local and environment-agnostic execution.'
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026-08-05',
    title: 'Phase 18: Platform Governance & Resilience',
    description: 'Hardening game state integrity by enforcing strict lobby management and WebSocket reconnection security.',
    features: [
      'Lobby Management & Ghost Game Prevention with room cancellation and clean up active registry states.',
      'Administrative Audit Logging tracking platform-wide administrative actions via AOP.',
      'Game Abandonment & Session Dismissal Logic treating Dismiss signals as terminal to prevent deadlocks.',
      'Watchdog Heartbeat mechanism with 30-second timeout threshold to drop inactive sessions cleanly.'
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-07-14',
    title: 'Phase 16: User Experience & Dashboards',
    description: 'Evolution from a purely functional game engine to a modern, analytical web application with performance metrics.',
    features: [
      'Interactive Performance Analytics rendering ELO progression and distributions.',
      'Global Leaderboard Integration with backend ranking endpoints and view-all modal support.',
      'Security & RBAC Architecture migrating from guest flags to a robust Role-Based Access Control model.'
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-06-19',
    title: 'Phase 15: Official Stable Release',
    description: 'Official transition to the first production-ready, stable state with core engine and API security.',
    features: [
      'Comprehensive project documentation and Swagger UI (OpenAPI 3) integration.',
      'Formalized project governance: CODE_OF_CONDUCT.md, license, and issue templates.',
      'Reliable end-game persistence using REQUIRES_NEW transaction propagation for data integrity.'
    ],
  },
  {
    version: 'v0.14.0',
    date: '2026-06-13',
    title: 'Phase 14: Core Engine Refactoring & UX Optimization',
    description: 'Transitioning the game engine to a server-authoritative timer model, ensuring absolute synchronization across clients.',
    features: [
      'Modular Directory Architecture: Migrated to a feature-based directory structure for decoupled UI atoms.',
      'Frontend Authentication UX: Refactored with AuthForm integration for state-driven validation.',
      'Chess Engine UI Refinements: Redesigned the Pawn Promotion modal and standardized color schemes.',
      'Core Engine Refactoring: Migrated game-time tracking logic from the frontend to GameService to eliminate clock discrepancies.'
    ],
  },
  {
    version: 'v0.13.0',
    date: '2026-04-30',
    title: 'Phase 13: Scalability & Resilience',
    description: 'Hardening the system against high-load scenarios and potential service failures by integrating Resilience4j and Redisson.',
    features: [
      'Enterprise Reliability & Concurrency Hardening: Implemented Circuit Breaker in Gameservice and rate limiters.',
      'Redisson Distributed Locking: Replaced local locks with Redis-based locks to ensure atomicity across backend nodes.',
      'Full-Stack Observability Integration: Enhanced Micrometer/Tempo tracing to capture fallback events and latency spikes.'
    ],
  },
  {
    version: 'v0.12.0',
    date: '2026-04-24',
    title: 'Phase 12: Quality Assurance & Code Integrity',
    description: 'Elevating the project\'s sustainability and reliability to the highest level by integrating SonarQube and comprehensive unit testing.',
    features: [
      'Code Excellence: Boosted coverage and significantly decreased technical debt via strict code rules.',
      'Static Analysis & Quality Gate Integration: Configured SonarQube to automatically inspect technical debt and code smells.',
      'JaCoCo Test Code Coverage: Configured JaCoCo for comprehensive test reporting, driving high line coverage.'
    ],
  },
  {
    version: 'v0.11.0',
    date: '2026-04-21',
    title: 'Phase 11: Full-Stack Observability (LGTM)',
    description: 'Introducing real-time visibility into the system\'s internal state using the LGTM stack (Loki, Grafana, Tempo, Prometheus).',
    features: [
      'Loki-Tempo Correlation & Distributed Tracing: Established seamless transition between Grafana log logs and Tempo traces.',
      'Grafana Dashboard Export & Export: Created dedicated Grafana dashboards for real-time business insights and metrics.',
      'Infrastructure Orchestration & LGTM Stack Integration: Deployed a comprehensive Docker Compose orchestration for the LGTM stack.'
    ],
  },
  {
    version: 'v0.10.0',
    date: '2026-04-20',
    title: 'Phase 10: Infrastructure, Containerization & DB Versioning',
    description: 'Transitioning the project from a local development setup to a production-ready, containerized architecture.',
    features: [
      'Infrastructure & Engineering Hardening: Fully containerized Docker setup for both backend (Java) and frontend (Nginx/Vite).',
      'Database Migration Engine (Liquibase): Integrated Liquibase for version-controlled database schema management.',
      'Service Health & Resilience: Implemented healthcheck protocols in Docker Compose to ensure correct container initialization.'
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-04-17',
    title: 'Phase 9: Remote Multiplayer & Global Matchmaking',
    description: 'Transitioning the project\'s evolution from a local engine to a distributed multiplayer architecture with real-time synchronization between disparate clients.',
    features: [
      'Distributed Session Orchestration: Finalized GamesService interface to manage real-time player pairing via unique UUIDs.',
      'Handshake & Reconnection Logic: Developed a robust WebSocket handshake mechanism that recovers game states during brief network interruptions.',
      'Concurrency Management: Integrated concurrent-map and thread-safe locks within the Game model to prevent race conditions.'
    ],
  },
  {
    version: 'v0.8.0',
    date: '2026-04-09',
    title: 'Phase 8: Server-Side Authority & Engineering Hardening',
    description: 'Established the Single Source of Truth to eliminate client-side trust, enforcing strict validation for every game action.',
    features: [
      'Server-Side Authoritative Logic: Migrated all move validation from the React frontend to the Spring Boot core.',
      'Enhanced Piece Modeling: Refactored pieces using Java 17 Sealed Classes and Pattern Matching for safety.',
      'Anti-Cheat Infrastructure: Developed server-side clock sync checks to prevent time manipulation.'
    ],
  },
  {
    version: 'v0.7.0',
    date: '2026-04-01',
    title: 'Phase 7: Identity Management & Authentication Security',
    description: 'Transition from anonymous platform to a user-centric ecosystem leveraging Keycloak IAM and OAuth2/OIDC.',
    features: [
      'Keycloak Based Authentication: Implemented secure registration and login workflows with password hashing.',
      'Frontend Gateway Defending: Secured React frontend with Keycloak integration and state-driven form management.'
    ],
  },
  {
    version: 'v0.6.0',
    date: '2026-03-26',
    title: 'Phase 6: Special Moves & Stability Refinement',
    description: 'FIDE special rules formalization and communication harmony between backend state machine and React UI.',
    features: [
      'Advanced Rule Completion: Enforced castling, promotion, and en-passant validation across frontend and backend.',
      'Live Operations Engine: Integrated live chess clock, check/checkmate indicators, and clean status feedback.'
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-03-23',
    title: 'Phase 5: UI Integration & Local Play Readiness',
    description: 'Bridging the core domain and the outer world, introducing a hybrid React frontend layout.',
    features: [
      'Polymorphic Refactoring: Delegated Java logic to separate movement engine classes for clean architecture.',
      'Enhanced Attack Detection: Streamlined tactical logic to leverage unified move flows and board states.'
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-03-19',
    title: 'Phase 4: Multiplayer Infrastructure & Real-Time Communication',
    description: 'Hybrid architecture integrating REST for provisioning and WebSockets (STOMP) for low-latency gaming.',
    features: [
      'Real-Time Infrastructure: Configured WebSocket endpoint with STOMP protocol and message broker.',
      'API Layer: Developed GameRoomController for session creation and real-time synchronization.'
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-03-18',
    title: 'Phase 3: Advanced Game Rules & Engine Implementation',
    description: 'Advanced game rules from a simple movement engine to a fully compliant chess adjudicator.',
    features: [
      'Draw Rule Implementation: Integrated 50-move rule, threefold repetition tracking, and insufficient material detection.',
      'Castling, Promotion & Checkmate Validation: Implemented comprehensive win/draw state machine and rule verification.'
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-03-16',
    title: 'Phase 2: Core Domain Modeling & Piece Logic',
    description: 'Completion of all individual piece movement rules, board initialization, and the central game orchestrator.',
    features: [
      'Game Orchestration: Implemented Game.java as the central domain orchestrator for turn management, move execution, and game lifecycle.',
      'King & Queen Implementation: Finalized king/queen validation logic and sliding diagonal/linear movement patterns.',
      'Rook, Bishop, Knight & Pawn Implementation: Comprehensive validation for orthogonal, diagonal, L-move, and double-step initial conditional capturing.'
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-03-08',
    title: 'Foundations & Scaffolding',
    description: 'Initial infrastructure setup and architectural foundations retroactively tracked to lifecycle governance.',
    features: [
      'Initial Infrastructure & Monorepo Setup: Initialized Spring Boot (v3.4.0) and React frontend (v19 + Vite).',
      'Strategic Planning & Engineering Standards: Established Domain-Driven Design (DDD) and Clean Architecture roadmap, enforcing Git Guidelines.'
    ],
  }
];

export const Changelog: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] text-slate-800 dark:text-slate-300 py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tight mb-4">
            Changelog & Version History
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            All notable changes, architectural milestones, and production releases of the chess platform. Adheres to Semantic Versioning.
          </p>
        </div>

        <div className="relative border-l border-slate-300 dark:border-slate-800 ml-4 md:ml-6">
          {releases.map((release) => (
            <div key={release.version} className="mb-12 ml-8 md:ml-12 relative group">
              
              <div className="absolute w-4 h-4 bg-indigo-600 dark:bg-indigo-500 rounded-full -left-10.25 md:-left-14.25 top-1.5 border-4 border-slate-50 dark:border-[#0b0f19] group-hover:scale-125 transition-transform duration-300"></div>
              
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors duration-300 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    {release.version}
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {release.date}
                    </span>
                  </h2>
                </div>
                
                <h3 className="text-sm md:text-base font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                  {release.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {release.description}
                </p>

                <div className="bg-slate-100 dark:bg-[#0b0f19]/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80">
                  <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Key Milestones & Deliverables</h4>
                  <ul className="space-y-2">
                    {release.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs md:text-sm">
                        <span className="text-emerald-500 font-bold mr-2 mt-0.5">✓</span>
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Explore all historical commits and pull requests on the{' '}
            <a 
              href="https://github.com/BatuhanBaysal/chess-platform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold uppercase tracking-wider"
            >
              GitHub Repository &rarr;
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Changelog;
