import React, { useState } from 'react';
import { Mail, Globe, Code2, Send, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export const Contact: React.FC = () => {
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
    <div className="w-full min-h-[calc(100vh-140px)] text-slate-800 dark:text-slate-300 py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3 bg-[#111827]/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest">
            <Terminal size={14} /> Get In Touch
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Contact & Collaboration
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            I am actively looking for backend and full-stack opportunities. You can reach out to me directly through professional channels or send a direct dispatch.
          </p>
        </div>

        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group bg-slate-900">
          <img 
            src="/assets/images/knight.jpg" 
            alt="Contact Chess Knight" 
            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 bg-indigo-500/10 px-3 py-1 rounded-full w-fit border border-indigo-500/20">
              Let's Build Together
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              Open for Backend & Full-Stack Opportunities
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={handleCopyEmail}
            className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Mail size={20} />
              </div>
              <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                {copiedEmail ? <><Check size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Click to Copy</>}
              </span>
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Email</span>
              <p className="text-sm font-bold text-white truncate">{email}</p>
            </div>
          </div>

          <a 
            href="https://www.linkedin.com/in/batuhan-baysal/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Globe size={20} />
              </div>
              <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">LinkedIn</span>
              <p className="text-sm font-bold text-white">batuhan-baysal</p>
            </div>
          </a>

          <a 
            href="https://github.com/BatuhanBaysal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Code2 size={20} />
              </div>
              <ExternalLink size={16} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">GitHub</span>
              <p className="text-sm font-bold text-white">BatuhanBaysal</p>
            </div>
          </a>

        </div>

        <div className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send size={18} className="text-indigo-400" /> Send a Direct Dispatch
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400">Your Name / Company</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hiring Manager"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400">Your Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">Message / Opportunity Details</label>
              <textarea 
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Let's talk about the backend role..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                {submitted ? 'Opening email client...' : 'Opens your default email client securely.'}
              </span>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
              >
                <Send size={14} /> Dispatch Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
