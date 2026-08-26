import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Database, HardDrive, Layers } from 'lucide-react';

interface HealthResponse {
  status: string;
  components?: {
    db?: { status: string; details?: any };
    redis?: { status: string; details?: any };
    diskSpace?: { status: string; details?: any };
  };
}

export const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/actuator/health`);
      if (!response.ok) throw new Error('Failed to fetch system health');
      const data = await response.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Connection refused to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isUp = health?.status === 'UP';
  const dbStatus = health?.components?.db?.status || (isUp ? 'UP' : 'DOWN');
  const redisStatus = health?.components?.redis?.status || (isUp ? 'UP' : 'DOWN');

  return (
    <div className="w-full min-h-[calc(100vh-140px)] text-slate-800 dark:text-slate-300 py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111827]/90 backdrop-blur-2xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-1">
              <Activity size={16} />
              <span>Observability & Monitoring</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
              System Health Status
            </h1>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Status</span>
          </button>
        </div>

        {error ? (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 text-rose-400 shadow-xl">
            <XCircle size={32} className="shrink-0" />
            <div>
              <h3 className="font-black uppercase tracking-wide text-sm">System Unreachable</h3>
              <p className="text-xs opacity-80">{error} (Make sure backend and core containers are running via Docker)</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Backend API</span>
                <Server size={20} className="text-indigo-400" />
              </div>
              <div className="flex items-center gap-4">
                {isUp ? (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={32} />
                ) : (
                  <XCircle className="text-rose-400 shrink-0" size={32} />
                )}
                <div>
                  <p className="text-xl font-black uppercase tracking-wider text-white">
                    {loading ? 'Checking...' : health?.status || 'UNKNOWN'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Spring Boot 3 Actuator</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">PostgreSQL DB</span>
                <Database size={20} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-4">
                {dbStatus === 'UP' ? (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={32} />
                ) : (
                  <XCircle className="text-rose-400 shrink-0" size={32} />
                )}
                <div>
                  <p className="text-xl font-black uppercase tracking-wider text-white">
                    {dbStatus}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">chess_db (Port 5432)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Redis Broker</span>
                <Layers size={20} className="text-amber-400" />
              </div>
              <div className="flex items-center gap-4">
                {redisStatus === 'UP' ? (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={32} />
                ) : (
                  <XCircle className="text-rose-400 shrink-0" size={32} />
                )}
                <div>
                  <p className="text-xl font-black uppercase tracking-wider text-white">
                    {redisStatus}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">In-Memory Store (6379)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Metrics & Tracing</span>
                <Activity size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-2">
                  LGTM Stack Active
                </p>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black text-indigo-400 hover:underline uppercase tracking-wider"
                >
                  Open Grafana Dashboard &rarr;
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Code Quality</span>
                <HardDrive size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-2">
                  SonarQube QA
                </p>
                <a
                  href="http://localhost:9000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black text-indigo-400 hover:underline uppercase tracking-wider"
                >
                  Open SonarQube &rarr;
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Time-Series Data</span>
                <Server size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-2">
                  Prometheus Server
                </p>
                <a
                  href="http://localhost:9090"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black text-indigo-400 hover:underline uppercase tracking-wider"
                >
                  Open Prometheus &rarr;
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SystemHealth;
