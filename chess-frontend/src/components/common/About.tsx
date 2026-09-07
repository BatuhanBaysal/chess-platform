import React, { useState, useEffect } from 'react';
import { Terminal, Layers, Activity, Cpu, ArrowUpRight } from 'lucide-react';

const aboutImages = [
  { src: '/assets/images/king.jpg', alt: 'Chess King Piece', title: 'Core Strategy & Leadership' },
  { src: '/assets/images/queen.jpg', alt: 'Chess Queen Piece', title: 'Dynamic Range & Power' },
  { src: '/assets/images/bishop.jpg', alt: 'Chess Bishop Piece', title: 'Tactical Precision' },
  { src: '/assets/images/knight.jpg', alt: 'Chess Knight Piece', title: 'Architectural Flexibility' },
  { src: '/assets/images/rook.jpg', alt: 'Chess Rook Piece', title: 'Robust Foundation' },
  { src: '/assets/images/pawn.jpg', alt: 'Chess Pawn Piece', title: 'Scalable Growth' },
  { src: '/assets/images/chess-platform.jpg', alt: 'Chess Platform Arena', title: 'Distributed Multiplayer' },
];

const journey = [
  {
    year: '2024',
    title: 'First hands-on experience',
    body: "A Full Stack Developer internship at Chippin (Tanı Pazarlama, part of Koç Group) — my first real exposure to Java, Spring Boot, and PostgreSQL in a production setting.",
  },
  {
    year: '2024–2025',
    title: 'Self-directed deep dive',
    body: 'Certifications and hands-on building across Spring Security, Docker, Kubernetes, AWS, and React/TypeScript — turning internship fundamentals into a real stack.',
  },
  {
    year: '2026',
    title: 'Chess Platform',
    body: 'My most complete project: a self-written FIDE rule engine, real-time multiplayer, and an AI opponent — built and run with the same discipline I want to bring to a team.',
  },
];

const competencies = [
  'Java 17', 'Spring Boot 3', 'Spring Cloud', 'React 19', 'TypeScript',
  'PostgreSQL', 'Redis', 'RabbitMQ', 'Keycloak', 'Docker & Kubernetes', 'OpenTelemetry',
];

export const About: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#070d13] text-slate-300 py-16 px-4 sm:px-6 lg:px-8 pt-28">
      <div className="max-w-4xl mx-auto space-y-16">

        <div className="space-y-5">
          <div className="flex items-center gap-2 text-[#5fa8d3] font-mono text-xs">
            <Terminal size={14} /> Junior Software Developer
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.05]">
            Hi, I'm Batuhan.
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
            I build backend systems in Java and Spring Boot, and I learn by shipping —
            this platform, and the five projects before it, are how I taught myself
            distributed systems, security, and observability from the ground up.
          </p>
        </div>

        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-[#16232f] bg-[#0c141d]">
          {aboutImages.map((img, index) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-[#070d13]/95 via-[#070d13]/20 to-transparent flex flex-col justify-end p-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">{img.title}</h2>
              </div>
            </div>
          ))}
          <div className="absolute bottom-5 right-5 z-20 flex gap-1.5">
            {aboutImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentImageIndex ? 'w-6 bg-[#5fa8d3]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-lg font-bold text-white">How I got here</h2>
          <div className="relative pl-8 space-y-10 before:content-[''] before:absolute before:left-1.75 before:top-2 before:bottom-2 before:w-px before:bg-[#1c2e3d]">
            {journey.map((step) => (
              <div key={step.title} className="relative">
                <div className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-[#070d13] border-2 border-[#5fa8d3]" />
                <div className="text-xs font-mono text-[#5fa8d3] mb-1">{step.year}</div>
                <h3 className="text-white font-bold mb-1.5">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Layers size={16} className="text-[#5fa8d3]" /> Backend & architecture
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hexagonal architecture, domain-driven design, and concurrency control —
              learned by hitting real race conditions and fixing them, not from a tutorial.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Activity size={16} className="text-[#5fa8d3]" /> Observability
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The LGTM stack (Loki, Grafana, Jaeger, Prometheus) alongside OpenTelemetry —
              so I can see what a system is actually doing, not just assume it.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu size={16} className="text-[#5fa8d3]" /> What I work with
          </div>
          <div className="flex flex-wrap gap-2">
            {competencies.map((tech) => (
              <span
                key={tech}
                className="bg-[#0f1b28] border border-[#1c2e3d] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="border-l-2 border-[#5fa8d3] pl-6 py-1">
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            I've been building toward this since my internship at Chippin (Tanı Pazarlama, part of Koç Group) —
            I'm looking for my first full-time role where I can keep working on
            distributed systems and concurrency problems like the ones in this project,
            alongside a team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-1 text-[#5fa8d3] text-sm font-medium mt-3 hover:gap-2 transition-all"
          >
            Get in touch <ArrowUpRight size={14} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default About;
