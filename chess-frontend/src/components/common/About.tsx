import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Layers, GitBranch, Terminal } from 'lucide-react';

const aboutImages = [
  { src: '/assets/images/king.jpg', alt: 'Chess King Piece', title: 'Core Strategy & Leadership' },
  { src: '/assets/images/queen.jpg', alt: 'Chess Queen Piece', title: 'Dynamic Range & Power' },
  { src: '/assets/images/bishop.jpg', alt: 'Chess Bishop Piece', title: 'Tactical Precision' },
  { src: '/assets/images/knight.jpg', alt: 'Chess Knight Piece', title: 'Architectural Flexibility' },
  { src: '/assets/images/rook.jpg', alt: 'Chess Rook Piece', title: 'Robust Foundation' },
  { src: '/assets/images/pawn.jpg', alt: 'Chess Pawn Piece', title: 'Scalable Growth' },
  { src: '/assets/images/chess-platform.jpg', alt: 'Chess Platform Arena', title: 'Distributed Multiplayer' }
];

export const About: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % aboutImages.length);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-140px)] text-slate-800 dark:text-slate-300 py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 bg-[#111827]/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest">
            <Terminal size={14} /> Software Engineer & Systems Architect
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            About Me & The Ecosystem <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            I am a Software Engineer specialized in backend and full-stack development, focusing heavily on enterprise software design principles, 
            <strong> Clean Architecture</strong>, <strong>Domain-Driven Design (DDD)</strong>, and distributed systems.
          </p>
        </div>

        <div className="relative w-full h-80 md:h-105 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group bg-slate-900">
          {aboutImages.map((img, index) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 md:p-8">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 bg-indigo-500/10 px-3 py-1 rounded-full w-fit border border-indigo-500/20">
                  Architectural Milestone
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                  {img.title}
                </h2>
              </div>
            </div>
          ))}

          <div className="absolute bottom-6 right-6 z-20 flex gap-2 bg-slate-950/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
            {aboutImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentImageIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3 text-indigo-400 font-bold text-sm">
              <Layers size={18} /> Backend & Architecture
            </div>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Applying Clean Architecture, DDD, and concurrency control mechanisms (pessimistic/optimistic locking) 
              to eliminate deadlocks and guarantee ACID compliance in distributed environments.
            </p>
          </div>

          <div className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
              <Activity size={18} /> Observability & DevOps (LGTM)
            </div>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Leveraging the LGTM Stack (Loki, Grafana, Jaeger, Prometheus) alongside OpenTelemetry and Micrometer 
              to achieve end-to-end distributed tracing and reduced MTTR.
            </p>
          </div>
        </div>

        <div className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-4">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu size={16} className="text-blue-400" /> Engineering Competency Set
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Java 17', 'Spring Boot 3', 'Spring Cloud', 'React 19', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Keycloak IAM', 'Docker & K8s', 'OpenTelemetry'].map((tech) => (
              <span key={tech} className="bg-slate-800/80 border border-slate-700/60 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-mono font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            This chess platform project is a core part of my engineering portfolio—built as a real-time, server-authoritative distributed multiplayer application leveraging Java 17, Spring Boot 3, Spring Cloud, React 19, TypeScript, and advanced telemetry stacks (LGTM).
          </p>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
            Every piece on the board represents a decoupled domain logic, carefully orchestrated through clean separation of concerns and robust event-driven patterns.
          </p>
        </div>

        <div className="bg-linear-to-r from-indigo-950/50 to-slate-900/50 border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-3">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            <GitBranch size={16} className="text-indigo-400" /> Objective & Vision
          </div>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Committed to mastering enterprise-level development since my internship experience at <strong>Chippin (Koç Holding)</strong>. 
            My goal is to build highly available distributed systems, tackle complex concurrency scenarios, and contribute 
            to innovative engineering teams that demand reliability at scale.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
