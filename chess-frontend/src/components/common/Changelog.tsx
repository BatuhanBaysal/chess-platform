import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';

const releases = [
  {
    version: 'v2.6.0',
    date: '2026-10-14',
    title: 'Phase 25: Final Polish, Strict Typing, RBAC UI & Player Identity',
    description: '12-column responsive dashboard (65% action / 35% telemetry), mobile zero-horizontal-scroll ergonomics, high-contrast light mode typography (text-slate-950), dual-layer modal scroll locks with ESC handling, and complete AAA Vitest & Playwright E2E test suites.',
    summary: 'UI redesign, mobile responsiveness, and test architecture elevated to v2.6.0 production standards with strict TypeScript DTO alignments and fixed match outcome logic.',
  },
  {
    version: 'v2.5.0',
    date: '2026-10-08',
    title: 'Phase 24: Quality Assurance & Integration Testing',
    description: 'Upgraded backend test suite to containerized PostgreSQL with Testcontainers, resolved Keycloak identity sync, and established frontend component testing with Vitest, RTL, and Playwright E2E.',
    summary: 'Complete testing pyramid established across Playwright E2E, Vitest/RTL unit tests, and Testcontainers PostgreSQL integration with zero Dependabot vulnerabilities.',
  },
  {
    version: 'v2.4.0',
    date: '2026-09-21',
    title: 'Phase 23: Asynchronous Eventing & Observability',
    description: 'Decoupled resource-intensive post-game Stockfish evaluations using RabbitMQ asynchronous queues and attached OpenTelemetry Java Agent for distributed tracing with the LGTM stack.',
    summary: 'Asynchronous event-driven game analysis via RabbitMQ and distributed tracing correlation with Loki, Tempo, and Grafana.',
  },
  {
    version: 'v2.3.0',
    date: '2026-09-16',
    title: 'Phase 22: Enterprise Data & Identity Management',
    description: 'Centralized IAM via Keycloak OAuth2/OIDC with RBAC role hierarchy and integrated AWS S3 SDK for file operations with local MinIO and production cloud storage.',
    summary: 'Centralized Keycloak OAuth2/OIDC authentication and S3-compatible cloud object storage for avatar uploads and PGN artifacts.',
  },
  {
    version: 'v2.2.0',
    date: '2026-09-08',
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
    title: 'Phase 1: Foundations & Scaffolding',
    description: 'Initial infrastructure setup and architectural foundations retroactively tracked to lifecycle governance.',
    summary: 'Initialized the monorepo structure, Spring Boot backend, and React frontend foundations.',
  }
];

export const Changelog: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVersion, setSelectedVersion] = useState(releases[0].version);

  const activeRelease = releases.find((r) => r.version === selectedVersion) || releases[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
      {/* Return to Dashboard */}
      <button 
        onClick={() => navigate('/')} 
        className="min-h-11 flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-5 uppercase font-black text-xs tracking-widest cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Menu
      </button>

      {/* Header */}
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
          Changelog & Releases
        </h1>
        <div className="h-1.5 w-24 sm:w-32 bg-indigo-600 mt-2 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* Left Releases List */}
        <div className="lg:col-span-4 bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-4 sm:p-5 shadow-sm h-115 sm:h-125 lg:h-155 flex flex-col justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2 py-2 mb-1 shrink-0">
              Releases & Phases ({releases.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
              {releases.map((release) => {
                const isSelected = release.version === selectedVersion;
                return (
                  <button
                    key={release.version}
                    onClick={() => setSelectedVersion(release.version)}
                    className={`w-full text-left px-3.5 py-3 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'border-transparent bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm tracking-wide">{release.version}</span>
                        {release.version === releases[0].version && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          }`}>
                            Latest
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 truncate font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {release.title}
                      </p>
                    </div>
                    <span className={`text-xs shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-auto lg:h-155 flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-5 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 gap-3">
              <div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/25 inline-block mb-2">
                  {activeRelease.date}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  {activeRelease.version}
                </h2>
              </div>
              {activeRelease.version === releases[0].version && (
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  <Sparkles size={14} /> Production Live
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              {activeRelease.title}
            </h3>

            <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeRelease.description}
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Executive Summary
              </h4>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeRelease.summary}
              </p>
            </div>
          </div>

          {/* Repository */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 mt-auto shrink-0">
            <span>Semantic Versioning Specification</span>
            <a 
              href="https://github.com/BatuhanBaysal/chess-platform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Repository</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Changelog;
