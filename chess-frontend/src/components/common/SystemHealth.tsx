import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Database, Layers, HardDrive, ArrowLeft } from 'lucide-react';

interface HealthResponse {
  status: string;
  components?: {
    db?: { status: string; details?: any };
    redis?: { status: string; details?: any };
    diskSpace?: { status: string; details?: any };
  };
}

export const SystemHealth: React.FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/actuator/health', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Vite proxy returned HTML instead of Actuator JSON. Ensure backend is running and proxy is active.');
      }

      const data: HealthResponse = await response.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Connection refused to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
  }, []);

  const isUp = health?.status === 'UP';
  const dbStatus = health?.components?.db?.status || (isUp ? 'UP' : 'DOWN');
  const redisStatus = health?.components?.redis?.status || (isUp ? 'UP' : 'DOWN');
  const showMonitoring = import.meta.env.VITE_SHOW_MONITORING === 'true';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-slate-900 dark:text-white animate-in fade-in duration-300">
      {/* Return to Dashboard */}
      <button 
        type="button"
        onClick={() => navigate('/')} 
        className="min-h-11 flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-5 uppercase font-black text-xs tracking-widest cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Menu
      </button>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 rounded-[2.5rem] shadow-sm mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase font-bold tracking-widest mb-1">
            <Activity size={16} />
            <span>Telemetry & Health Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 dark:text-white tracking-tight">
            System Health Status
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void fetchHealth()}
          disabled={loading}
          className="min-h-11 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error ? (
        <div className="p-6 rounded-4xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center gap-4 text-rose-700 dark:text-rose-400 shadow-sm">
          <XCircle size={32} className="shrink-0 text-rose-600" />
          <div>
            <h3 className="font-black uppercase tracking-wide text-sm">System Unreachable</h3>
            <p className="text-xs font-medium opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Backend API */}
          <div className="p-6 rounded-4xl bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Backend API</span>
              <Server size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-center gap-3.5">
              {isUp ? (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={30} />
              ) : (
                <XCircle className="text-rose-500 shrink-0" size={30} />
              )}
              <div>
                <p className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  {loading ? 'Checking...' : health?.status || 'UNKNOWN'}
                </p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Spring Boot Actuator</p>
              </div>
            </div>
          </div>

          {/* PostgreSQL DB */}
          <div className="p-6 rounded-4xl bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">PostgreSQL DB</span>
              <Database size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-3.5">
              {dbStatus === 'UP' ? (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={30} />
              ) : (
                <XCircle className="text-rose-500 shrink-0" size={30} />
              )}
              <div>
                <p className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  {dbStatus}
                </p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">chess_db (Port 5432)</p>
              </div>
            </div>
          </div>

          {/* Redis Broker */}
          <div className="p-6 rounded-4xl bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Redis Broker</span>
              <Layers size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-center gap-3.5">
              {redisStatus === 'UP' ? (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={30} />
              ) : (
                <XCircle className="text-rose-500 shrink-0" size={30} />
              )}
              <div>
                <p className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  {redisStatus}
                </p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">In-Memory Store (6379)</p>
              </div>
            </div>
          </div>

          {showMonitoring && (
            <>
              <div className="p-6 rounded-4xl bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Metrics & Tracing</span>
                  <Activity size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white mb-1">
                    LGTM Stack Active
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Grafana Dashboard (Port 3000)</span>
                </div>
              </div>

              <div className="p-6 rounded-4xl bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Code Quality</span>
                  <HardDrive size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white mb-1">
                    SonarQube QA
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">SonarQube Server (Port 9002)</span>
                </div>
              </div>

              <div className="p-6 rounded-4xl bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Time-Series Data</span>
                  <Server size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white mb-1">
                    Prometheus Server
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Metrics Engine (Port 9090)</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
