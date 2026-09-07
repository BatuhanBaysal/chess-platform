import React, { useState } from 'react';

const releases = [
  {
    version: 'v2.2.0',
    date: '2026-09-07',
    title: 'Phase 21: Production Deployment & Cloud Demo',
    description: 'Provisioning multi-container environments, setting up Vercel static hosting, and deploying the full backend, database, and observability stack via Docker Compose on Oracle Cloud.',
    summary: 'Cloud migration completed. The platform is now fully live with automated container orchestration on Oracle Cloud and frontend edge hosting on Vercel.',
  },
  {
    version: 'v2.1.0',
    date: '2026-08-31',
    title: 'Phase 20: Enterprise Refactoring & Production Readiness',
    description: 'Enforcing strict transaction boundaries, ACID compliance, distributed locks, enterprise-grade decoupling, and core domain modeling.',
    summary: 'Core domain fortified with strict transaction safety, distributed locking, and robust concurrency handling for simultaneous game sessions.',
  },
  {
    version: 'v2.0.0',
    date: '2026-08-14',
    title: 'Phase 19: AI Integration & Training Ecosystem',
    description: 'Expanding the training ecosystem with automated computer opponent capabilities powered by the Stockfish chess engine.',
    summary: 'Integrated Stockfish AI engine capabilities, enabling single-player training modes, real-time hints, and move quality evaluations.',
  },
  {
    version: 'v1.2.0',
    date: '2026-08-05',
    title: 'Phase 18: Platform Governance & Resilience',
    description: 'Hardening game state integrity by enforcing strict lobby management and WebSocket reconnection security.',
    summary: 'Enhanced platform stability with ghost game prevention, administrative audit logs, and automated heartbeat cleanups.',
  },
  {
    version: 'v1.1.0',
    date: '2026-07-14',
    title: 'Phase 16: User Experience & Dashboards',
    description: 'Evolution from a purely functional game engine to a modern, analytical web application with performance metrics.',
    summary: 'Introduced interactive analytics, global leaderboards, and an upgraded Role-Based Access Control (RBAC) security model.',
  },
  {
    version: 'v1.0.0',
    date: '2026-06-19',
    title: 'Phase 15: Official Stable Release',
    description: 'Official transition to the first production-ready, stable state with core engine and API security.',
    summary: 'Reached official stable production readiness featuring comprehensive Swagger documentation and hardened database transactions.',
  },
  {
    version: 'v0.14.0',
    date: '2026-06-13',
    title: 'Phase 14: Core Engine Refactoring & UX Optimization',
    description: 'Transitioning the game engine to a server-authoritative timer model, ensuring absolute synchronization across clients.',
    summary: 'Refactored frontend UI components and moved game-clock tracking directly to the backend to eliminate time discrepancies.',
  },
  {
    version: 'v0.13.0',
    date: '2026-04-30',
    title: 'Phase 13: Scalability & Resilience',
    description: 'Hardening the system against high-load scenarios and potential service failures by integrating Resilience4j and Redisson.',
    summary: 'Implemented circuit breakers and distributed Redis locking to ensure high availability and data atomicity under heavy load.',
  },
  {
    version: 'v0.12.0',
    date: '2026-04-24',
    title: 'Phase 12: Quality Assurance & Code Integrity',
    description: 'Elevating the project\'s sustainability and reliability to the highest level by integrating SonarQube and comprehensive unit testing.',
    summary: 'Integrated automated SonarQube quality gates and JaCoCo test coverage reporting to eliminate technical debt.',
  },
  {
    version: 'v0.11.0',
    date: '2026-04-21',
    title: 'Phase 11: Full-Stack Observability (LGTM)',
    description: 'Introducing real-time visibility into the system\'s internal state using the LGTM stack (Loki, Grafana, Tempo, Prometheus).',
    summary: 'Established comprehensive system monitoring, distributed tracing, and centralized logging using the LGTM stack.',
  },
  {
    version: 'v0.10.0',
    date: '2026-04-20',
    title: 'Phase 10: Infrastructure, Containerization & DB Versioning',
    description: 'Transitioning the project from a local development setup to a production-ready, containerized architecture.',
    summary: 'Containerized the entire application ecosystem with Docker and automated database migrations using Liquibase.',
  },
  {
    version: 'v0.9.0',
    date: '2026-04-17',
    title: 'Phase 9: Remote Multiplayer & Global Matchmaking',
    description: 'Transitioning the project\'s evolution from a local engine to a distributed multiplayer architecture with real-time synchronization between disparate clients.',
    summary: 'Enabled remote peer-to-peer matchmaking, robust WebSocket handshakes, and automatic session recovery after disconnects.',
  },
  {
    version: 'v0.8.0',
    date: '2026-04-09',
    title: 'Phase 8: Server-Side Authority & Engineering Hardening',
    description: 'Established the Single Source of Truth to eliminate client-side trust, enforcing strict validation for every game action.',
    summary: 'Shifted all move validation and rules enforcement entirely to the backend to establish absolute server authority.',
  },
  {
    version: 'v0.7.0',
    date: '2026-04-01',
    title: 'Phase 7: Identity Management & Authentication Security',
    description: 'Transition from anonymous platform to a user-centric ecosystem leveraging Keycloak IAM and OAuth2/OIDC.',
    summary: 'Introduced secure user accounts, authentication workflows, and frontend route protection.',
  },
  {
    version: 'v0.6.0',
    date: '2026-03-26',
    title: 'Phase 6: Special Moves & Stability Refinement',
    description: 'FIDE special rules formalization and communication harmony between backend state machine and React UI.',
    summary: 'Completed complex chess rules like castling, en-passant, and promotion alongside real-time clock integration.',
  },
  {
    version: 'v0.5.0',
    date: '2026-03-23',
    title: 'Phase 5: UI Integration & Local Play Readiness',
    description: 'Bridging the core domain and the outer world, introducing a hybrid React frontend layout.',
    summary: 'Built the initial interactive board layout and modularized movement logic for local gameplay.',
  },
  {
    version: 'v0.4.0',
    date: '2026-03-19',
    title: 'Phase 4: Multiplayer Infrastructure & Real-Time Communication',
    description: 'Hybrid architecture integrating REST for provisioning and WebSockets (STOMP) for low-latency gaming.',
    summary: 'Set up the foundational real-time WebSocket communication infrastructure for multiplayer rooms.',
  },
  {
    version: 'v0.3.0',
    date: '2026-03-18',
    title: 'Phase 3: Advanced Game Rules & Engine Implementation',
    description: 'Advanced game rules from a simple movement engine to a fully compliant chess adjudicator.',
    summary: 'Implemented advanced draw conditions, checkmate validation, and rule enforcement mechanisms.',
  },
  {
    version: 'v0.2.0',
    date: '2026-03-16',
    title: 'Phase 2: Core Domain Modeling & Piece Logic',
    description: 'Completion of all individual piece movement rules, board initialization, and the central game orchestrator.',
    summary: 'Designed the core Java game engine and movement validation logic for all chess pieces.',
  },
  {
    version: 'v0.1.0',
    date: '2026-03-08',
    title: 'Foundations & Scaffolding',
    description: 'Initial infrastructure setup and architectural foundations retroactively tracked to lifecycle governance.',
    summary: 'Initialized the monorepo structure, Spring Boot backend, and React frontend foundations.',
  }
];

export const Changelog: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState(releases[0].version);

  const activeRelease = releases.find((r) => r.version === selectedVersion) || releases[0];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] text-slate-800 dark:text-slate-300 py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tight mb-4">
            Changelog & Version History
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore the evolution, architectural milestones, and production releases of the chess platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-black/20 max-h-175 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
              Releases & Phases
            </h3>
            <div className="space-y-1.5">
              {releases.map((release) => {
                const isSelected = release.version === selectedVersion;
                return (
                  <button
                    key={release.version}
                    onClick={() => setSelectedVersion(release.version)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-wide">{release.version}</span>
                        {release.version === releases[0].version && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            Latest
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {release.title}
                      </p>
                    </div>
                    <span className={`text-xs ${isSelected ? 'text-white' : 'text-slate-400 opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 sticky top-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 inline-block mb-3">
                  {activeRelease.date}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                  {activeRelease.version}
                </h2>
              </div>
            </div>

            <h3 className="text-base md:text-lg font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
              {activeRelease.title}
            </h3>

            <p className="text-base font-medium text-slate-700 dark:text-slate-200 mb-6 leading-relaxed">
              {activeRelease.description}
            </p>

            <div className="bg-slate-50 dark:bg-[#0b0f19]/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 mb-6">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                Executive Summary
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeRelease.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
              <span>Semantic Versioning Release</span>
              <a 
                href="https://github.com/BatuhanBaysal/chess-platform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold uppercase tracking-wider"
              >
                View on GitHub &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Changelog;
