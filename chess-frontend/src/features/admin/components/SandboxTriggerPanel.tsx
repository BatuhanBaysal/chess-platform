import { useState, type SyntheticEvent } from 'react';
import { Terminal, Play, CheckCircle2, Loader2 } from 'lucide-react';
import { triggerSandboxGame } from '../../../api/adminService';

interface SandboxTriggerPanelProps {
    readonly onGameTriggered: () => void;
}

export default function SandboxTriggerPanel({ onGameTriggered }: Readonly<SandboxTriggerPanelProps>) {
    const [whiteId, setWhiteId] = useState<string>('');
    const [blackId, setBlackId] = useState<string>('');
    const [sandboxLoading, setSandboxLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleTriggerSandbox = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!whiteId || !blackId) return;
        setSandboxLoading(true);
        setSuccessMessage(null);
        try {
            await triggerSandboxGame(Number(whiteId), Number(blackId));
            setSuccessMessage("Sandbox event dispatched successfully!");
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
        <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Terminal size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">
                    Developer Sandbox Trigger
                </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-5">
                Simulate a test match between two user accounts to verify event bus and socket listeners.
            </p>
            
            <form onSubmit={handleTriggerSandbox} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                    <label htmlFor="sandbox-white-id" className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        White Player ID
                    </label>
                    <input 
                        id="sandbox-white-id"
                        type="number" 
                        value={whiteId} 
                        onChange={(e) => setWhiteId(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="sandbox-black-id" className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Black Player ID
                    </label>
                    <input 
                        id="sandbox-black-id"
                        type="number" 
                        value={blackId} 
                        onChange={(e) => setBlackId(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={sandboxLoading}
                    className="min-h-11 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                    {sandboxLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={15} />}
                    <span>Create Test Match</span>
                </button>
            </form>

            {successMessage && (
                <div className="mt-4 flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-bold animate-in fade-in">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
        </div>
    );
}
