import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Layers, Activity, Cpu, ArrowUpRight, ArrowLeft, Globe, Code2, ExternalLink, Award } from 'lucide-react';

const aboutImages = [
  { src: '/assets/images/king.jpg', alt: 'Chess King Piece', title: 'Core Strategy & Leadership' },
  { src: '/assets/images/queen.jpg', alt: 'Chess Queen Piece', title: 'Dynamic Range & Power' },
  { src: '/assets/images/bishop.jpg', alt: 'Chess Bishop Piece', title: 'Tactical Precision' },
  { src: '/assets/images/knight.jpg', alt: 'Chess Knight Piece', title: 'Architectural Flexibility' },
  { src: '/assets/images/rook.jpg', alt: 'Chess Rook Piece', title: 'Robust Foundation' },
  { src: '/assets/images/pawn.jpg', alt: 'Chess Pawn Piece', title: 'Scalable Growth' },
  { src: '/assets/images/chess-platform.jpg', alt: 'Chess Platform Arena', title: 'Distributed Multiplayer' },
];

interface JourneyItem {
  year: string;
  type: 'Project' | 'Internship' | 'Education';
  title: string;
  body: string;
  githubUrl?: string;
}

const journey: JourneyItem[] = [
  {
    year: 'Mar – Oct 2026',
    type: 'Project',
    title: 'Chess Platform — Real-Time Multiplayer Ecosystem',
    body: 'Server-authoritative, real-time multiplayer chess platform engineered with Java 17, Spring Boot 3, and React 19. Implemented an in-house FIDE rule validation engine, Stockfish 16 UCI sparring, sub-20ms WebSocket telemetry, and complete AAA Vitest & Playwright E2E test suites.',
    githubUrl: 'https://github.com/BatuhanBaysal/chess-platform',
  },
  {
    year: 'Feb 2026',
    type: 'Project',
    title: 'Secure Banking Core — Modular Monolith',
    body: 'Modular backend architecture built with Java 17 and Spring Boot 3.4. Features Keycloak (OAuth2/OIDC) integration for SSO and RBAC, Resilience4j fault tolerance, Redis caching, and RabbitMQ event-driven messaging.',
    githubUrl: 'https://github.com/BatuhanBaysal/secure-banking-core',
  },
  {
    year: 'Nov – Dec 2025',
    type: 'Project',
    title: 'Spring Cloud Observable Microservices (EMG)',
    body: 'E-commerce microservice architecture with Spring Cloud Eureka service discovery, centralized API Gateway, JWT security with Redis instant token blacklisting, and distributed tracing via Prometheus, Grafana, and Zipkin.',
    githubUrl: 'https://github.com/BatuhanBaysal/spring-cloud-observable-microservices',
  },
  {
    year: 'Nov 2025',
    type: 'Project',
    title: 'Fullstack Secure Note App',
    body: 'Stateless JWT-secured note management web application built with Spring Boot and React. Features role-based access (Admin/User), server-side pagination, and centralized Axios interceptors for consistent error handling.',
    githubUrl: 'https://github.com/BatuhanBaysal/fullstack-secure-noteapp-spring-react',
  },
  {
    year: 'Oct 2025',
    type: 'Project',
    title: 'Auth & Notification Microservice Stack',
    body: 'Event-driven microservice system where the Auth service publishes UserRegisteredEvent over Redis Pub/Sub, asynchronously consumed by a Notification service for token confirmation and email delivery.',
    githubUrl: 'https://github.com/BatuhanBaysal/auth-notification-microservice-stack',
  },
  {
    year: 'Mar – May 2025',
    type: 'Project',
    title: 'BatuBook / Bookverse REST API',
    body: 'Comprehensive RESTful API for book and library catalog management built with Spring Boot, Spring Data JPA, and PostgreSQL, enforcing relational constraints and clean layered architecture.',
    githubUrl: 'https://github.com/BatuhanBaysal/bookverse-rest-api',
  },
  {
    year: 'Jul – Aug 2024',
    type: 'Internship',
    title: 'Chippin (Koç Group) — Full Stack Intern',
    body: 'Developed an internal Employee Management System with Java 17, Spring Boot, and PostgreSQL in a corporate production setting. Refactored the architecture post-internship with DTO and Mapper patterns to improve code maintainability.',
    githubUrl: 'https://github.com/BatuhanBaysal/internship-full-stack-development-project',
  },
  {
    year: 'Feb – Jun 2024',
    type: 'Education',
    title: 'Graduation Capstone: FinBERT + LSTM Sentiment Analysis',
    body: 'NLP-based financial market sentiment analysis system combining a hybrid FinBERT and LSTM deep learning model (90%+ accuracy) with a real-time React dashboard, leading a Scrum team.',
  },
  {
    year: 'Jan – Feb 2024',
    type: 'Internship',
    title: 'Netax Bilişim — Frontend Intern',
    body: 'Built reactive, component-driven web interfaces using the Vue.js Composition API, focusing on responsive layouts and clean frontend state management.',
    githubUrl: 'https://github.com/BatuhanBaysal/internship-frontend-development-project',
  },
  {
    year: '2019 – 2024',
    type: 'Education',
    title: 'B.Sc. in Computer Engineering — Istanbul Kültür University',
    body: 'Graduated from the 100% English curriculum. Completed English Preparatory Program with B2 proficiency, focusing on algorithms, object-oriented software design, and database systems.',
  },
];

const certifications = [
  {
    provider: 'Turkcell GNÇYTNK',
    title: 'Professional Career Program & Corporate Orientation Certification',
    date: 'May 2026',
  },
  {
    provider: 'Turkcell Geleceği Yazanlar',
    title: 'Java 101, 201, 301 & Advanced Java 101, 201 Certification Exams',
    date: 'Jan – Feb 2026',
  },
  {
    provider: 'Udemy Specializations (150+ Hours)',
    title: 'Java, Spring Boot 3, Unit Testing (JUnit 5/Mockito), Docker, Kubernetes, AWS & Full-Stack React',
    date: 'Sep 2024 – Jan 2025',
  },
  {
    provider: 'BTK Akademi & TÜBİTAK BİLGEM YTE',
    title: 'Vue.js Bootcamp, Java Development & Mock-Up / Figma Architecture',
    date: 'Oct 2023',
  },
];

const competencies = [
  'Java 17', 'Spring Boot 3', 'Spring Cloud', 'Spring Security', 'Hibernate',
  'React 19', 'Vue.js', 'TypeScript', 'Tailwind CSS',
  'Keycloak', 'JWT', 'RabbitMQ', 'WebSocket (STOMP)',
  'PostgreSQL', 'MySQL', 'Redis', 'Liquibase',
  'Grafana', 'Prometheus', 'OpenTelemetry', 'SonarQube', 'JUnit 5 & Mockito',
  'Docker', 'Kubernetes', 'AWS', 'Git & GitHub'
];

export const About: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
      {/* Return to Dashboard */}
      <button 
        onClick={() => navigate('/')} 
        className="min-h-11 flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-5 uppercase font-black text-xs tracking-widest cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Menu
      </button>

      {/* Main Header */}
      <div className="space-y-4 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 text-indigo-700 dark:text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Terminal size={14} /> Junior Software Developer
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
          Hi, I'm Batuhan Baysal.
        </h1>
        <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl font-medium">
          Computer Engineering graduate focusing on backend and full-stack development with Java, Spring Boot, and React/TypeScript. I learn by building and shipping end-to-end applications — focusing on clean code, database consistency, and reliable real-time communication.
        </p>

        {/* Quick Social Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="https://github.com/BatuhanBaysal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white hover:border-indigo-500 transition-all cursor-pointer"
          >
            <Code2 size={14} className="text-purple-600 dark:text-purple-400" />
            <span>GitHub Profile</span>
          </a>
          <a
            href="https://www.linkedin.com/in/batuhan-baysal/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white hover:border-indigo-500 transition-all cursor-pointer"
          >
            <Globe size={14} className="text-blue-600 dark:text-blue-400" />
            <span>LinkedIn Network</span>
          </a>
        </div>
      </div>

      {/* Interactive Showcase Carousel Card */}
      <div className="relative w-full h-64 sm:h-72 md:h-80 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#070b19] shadow-sm mb-10 sm:mb-12">
        {aboutImages.map((img, index) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-1 bg-indigo-500/20 px-3 py-0.5 rounded-full w-fit border border-indigo-500/30">
                Core Milestone
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{img.title}</h2>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 z-20 flex gap-2">
          {aboutImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentImageIndex ? 'w-7 bg-indigo-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-10 space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
            Projects & Experience
          </h2>
          <div className="h-1 w-16 bg-indigo-600 mt-2 rounded-full" />
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {journey.map((step) => (
            <div key={step.title} className="relative">
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#070b19] border-3 border-indigo-600 shadow-xs" />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {step.year}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {step.type}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mb-1.5">
                {step.title}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mb-2.5">
                {step.body}
              </p>
              {step.githubUrl && (
                <a
                  href={step.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 transition-colors"
                >
                  <Code2 size={12} />
                  <span>View Repository</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications & Continuous Learning Summary Card */}
      <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-10 space-y-5">
        <div className="flex items-center gap-2.5 text-slate-950 dark:text-white font-black text-base uppercase tracking-wide">
          <Award size={20} className="text-indigo-600 dark:text-indigo-400" />
          <span>Certifications & Technical Training</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div 
              key={cert.provider} 
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-2 shadow-2xs"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {cert.provider}
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-950 dark:text-white mt-0.5 leading-snug">
                  {cert.title}
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                {cert.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Engineering Disciplines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-4xl p-6 sm:p-7 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2.5 text-slate-950 dark:text-white font-black text-sm uppercase tracking-wide">
            <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Backend & Full-Stack Development</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            RESTful API development with Java and Spring Boot, PostgreSQL schema design, and responsive React single-page applications with TypeScript.
          </p>
        </div>

        <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-4xl p-6 sm:p-7 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2.5 text-slate-950 dark:text-white font-black text-sm uppercase tracking-wide">
            <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Testing & Code Quality</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            Writing unit tests using JUnit 5 and Mockito, applying Arrange-Act-Assert standards, and validating workflows with automated Playwright E2E tests.
          </p>
        </div>
      </div>

      {/* Technical Competencies / Stack */}
      <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-10 space-y-4">
        <div className="flex items-center gap-2.5 text-slate-950 dark:text-white font-black text-sm uppercase tracking-wide">
          <Cpu size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>Core Tech Stack</span>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {competencies.map((tech) => (
            <span
              key={tech}
              className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold shadow-2xs"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Dispatch / Contact Banner */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-indigo-600 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm sm:text-base font-black text-slate-950 dark:text-white uppercase tracking-wide">
            Looking for New Opportunities
          </h4>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium mt-1">
            I am actively seeking junior backend or full-stack software developer positions where I can contribute and grow alongside an engineering team.
          </p>
        </div>
        <button
          onClick={() => navigate('/contact')}
          className="min-h-11 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
        >
          <span>Get in Touch</span>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default About;
