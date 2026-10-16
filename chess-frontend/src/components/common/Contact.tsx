import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Globe, Code2, Send, Copy, Check, Terminal, ExternalLink, ArrowLeft } from 'lucide-react';

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const email = 'batuhanbaysal3@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${formData.name} via Chess Platform`);
    const body = encodeURIComponent(formData.message);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
      {/* Return to Dashboard */}
      <button 
        onClick={() => navigate('/')} 
        className="min-h-11 flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-5 uppercase font-black text-xs tracking-widest cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Menu
      </button>

      {/* Header Banner */}
      <div className="space-y-3 bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase font-bold tracking-widest">
          <Terminal size={14} /> Direct Communications
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
          Contact & Collaboration
        </h1>
        <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
          Open for backend and full-stack software engineering opportunities, architectural discussions, or platform telemetry inquiries.
        </p>
      </div>

      {/* Hero Knight Banner Card */}
      <div className="relative w-full h-48 sm:h-64 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800/80 group bg-slate-950 mb-6 sm:mb-8">
        <img 
          src="/assets/images/knight.jpg" 
          alt="Contact Chess Knight" 
          className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-2 bg-indigo-500/15 px-3 py-1 rounded-full w-fit border border-indigo-500/25">
            Engineering & Opportunities
          </span>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-wide">
            Open for Backend & Full-Stack Roles
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
        {/* Email */}
        <div 
          onClick={handleCopyEmail}
          className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
              <Mail size={20} />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
              {copiedEmail ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Email Dispatch</span>
            <p className="text-sm font-black text-slate-950 dark:text-white truncate mt-0.5">{email}</p>
          </div>
        </div>

        {/* LinkedIn */}
        <a 
          href="https://www.linkedin.com/in/batuhan-baysal/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-500/20">
              <Globe size={20} />
            </div>
            <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">LinkedIn Network</span>
            <p className="text-sm font-black text-slate-950 dark:text-white truncate mt-0.5">batuhan-baysal</p>
          </div>
        </a>

        {/* GitHub */}
        <a 
          href="https://github.com/BatuhanBaysal" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-200 dark:border-purple-500/20">
              <Code2 size={20} />
            </div>
            <ExternalLink size={16} className="text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">GitHub Projects</span>
            <p className="text-sm font-black text-slate-950 dark:text-white truncate mt-0.5">BatuhanBaysal</p>
          </div>
        </a>
      </div>

      {/* Direct Dispatch Form */}
      <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Send size={18} className="text-indigo-600 dark:text-indigo-400" /> Dispatch Transmission
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400">
                Your Name / Organization
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Engineering Lead"
                className="w-full min-h-11 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400">
                Your Email Address
              </label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@organization.com"
                className="w-full min-h-11 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400">
              Message / Opportunity Details
            </label>
            <textarea 
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Inquire about backend engineering, architecture, or collaboration..."
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {submitted ? 'Opening default mail application...' : 'Opens your default email client securely.'}
            </span>
            <button 
              type="submit"
              className="w-full sm:w-auto min-h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Send size={14} /> Dispatch Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
