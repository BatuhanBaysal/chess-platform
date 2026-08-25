import React, { useState } from 'react';
import { Terminal, Play, CheckCircle2 } from 'lucide-react';
import { triggerSandboxGame } from '../../../api/adminService';

interface SandboxTriggerPanelProps {
    onGameTriggered: () => void;
}

export default function SandboxTriggerPanel({ onGameTriggered }: SandboxTriggerPanelProps) {
    const [whiteId, setWhiteId] = useState<string>('');
    const [blackId, setBlackId] = useState<string>('');
    const [sandboxLoading, setSandboxLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleTriggerSandbox = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!whiteId || !blackId) return;
        setSandboxLoading(true);
        setSuccessMessage(null);
        try {
            await triggerSandboxGame(Number(whiteId), Number(blackId));
            setSuccessMessage("Sandbox game triggered successfully!");
            onGameTriggered();
            setWhiteId('');
            setBlackId('');
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            console.error("Sandbox trigger failed:", error);
        } finally {
            setSandboxLoading(false);
        }
    };

    return (
        <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                <Terminal size={20} /> Developer Sandbox Trigger
            </h2>
            
            <form onSubmit={handleTriggerSandbox} className="flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">White Player ID</label>
                    <input 
                        type="number" 
                        value={whiteId} 
                        onChange={(e) => setWhiteId(e.target.value)}
                        placeholder="e.g: 1"
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Black Player ID</label>
                    <input 
                        type="number" 
                        value={blackId} 
                        onChange={(e) => setBlackId(e.target.value)}
                        placeholder="e.g: 2"
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={sandboxLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                    <Play size={14} /> {sandboxLoading ? 'Triggering...' : 'Start Test Game'}
                </button>
            </form>

            {successMessage && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold animate-fadeIn">
                    <CheckCircle2 size={16} />
                    <span>{successMessage}</span>
                </div>
            )}
        </div>
    );
}
