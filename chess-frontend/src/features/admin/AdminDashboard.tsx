import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getAllUsers, 
    deleteUserAccount, 
    getActiveGames, 
    forceFinishGame, 
    getAuditLogs,
    type AdminUserResponseDTO, 
    type AdminActiveGameResponseDTO,
    type AdminAuditLogResponseDTO
} from '../../api/adminService';
import { 
    ShieldAlert, 
    RefreshCcw, 
    ArrowLeft, 
    Users, 
    Swords, 
    FileText, 
    Wrench 
} from 'lucide-react';
import SandboxTriggerPanel from './components/SandboxTriggerPanel';
import ActiveGamesPanel from './components/ActiveGamesPanel';
import UserManagementPanel from './components/UserManagementPanel';
import AuditLogsPanel from './components/AuditLogsPanel';

type AdminTab = 'users' | 'sessions' | 'logs' | 'sandbox';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    const [users, setUsers] = useState<AdminUserResponseDTO[]>([]);
    const [activeGames, setActiveGames] = useState<AdminActiveGameResponseDTO[]>([]);
    const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponseDTO[]>([]);
    
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingGames, setLoadingGames] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [userFilter, setUserFilter] = useState<'all' | 'members' | 'guests'>('all');
    const [currentPage, setCurrentPage] = useState<number>(0); 
    const [pageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(0);

    const [auditPage, setAuditPage] = useState<number>(0);
    const [auditTotalPages, setAuditTotalPages] = useState<number>(1);
    const [auditTotalElements, setAuditTotalElements] = useState<number>(0);

    const fetchUsersData = useCallback(async (page: number, filter: string = userFilter) => {
        setLoadingUsers(true);
        try {
            const data = await getAllUsers(page, pageSize, filter); 
            setUsers(data.content);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoadingUsers(false);
        }
    }, [pageSize, userFilter]);

    const fetchActiveGamesData = useCallback(async () => {
        setLoadingGames(true);
        try {
            const data = await getActiveGames();
            setActiveGames(data);
        } catch (error) {
            console.error("Failed to fetch active games:", error);
        } finally {
            setLoadingGames(false);
        }
    }, []);

    const fetchAuditLogsData = useCallback(async (page: number) => {
        setLoadingLogs(true);
        try {
            const data = await getAuditLogs(page, pageSize);
            setAuditLogs(data.content);
            setAuditTotalPages(data.totalPages || 1);
            setAuditTotalElements(data.totalElements || data.content.length);
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setLoadingLogs(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchUsersData(currentPage, userFilter);
        fetchActiveGamesData();
        fetchAuditLogsData(auditPage);
    }, [currentPage, auditPage, userFilter, fetchUsersData, fetchActiveGamesData, fetchAuditLogsData]);

    const handleFilterChange = (filter: 'all' | 'members' | 'guests') => {
        setUserFilter(filter);
        setCurrentPage(0);
        fetchUsersData(0, filter);
    };

    const handleDeleteUser = async (id: number) => {
        if (window.confirm("Are you sure you want to permanently delete this user account?")) {
            try {
                setUsers((prev) => prev.filter((user) => user.id !== id));
                setTotalElements((prev) => Math.max(0, prev - 1));

                await deleteUserAccount(id);
                fetchUsersData(currentPage, userFilter);
                fetchAuditLogsData(auditPage);
            } catch (error) {
                console.error("Failed to delete user:", error);
                fetchUsersData(currentPage, userFilter);
            }
        }
    };

    const handleForceFinish = async (gameId: string) => {
        if (window.confirm(`Game session (${gameId}) will be forcefully terminated. Are you sure?`)) {
            try {
                await forceFinishGame(gameId);
                fetchActiveGamesData();
                fetchAuditLogsData(auditPage);
            } catch (error) {
                console.error("Failed to force finish game:", error);
            }
        }
    };

    const handleRefreshAll = () => {
        fetchUsersData(currentPage, userFilter);
        fetchActiveGamesData();
        fetchAuditLogsData(auditPage);
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
            {/* Return to Dashboard */}
            <button 
                onClick={() => navigate('/menu')} 
                className="min-h-11 flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors uppercase font-black text-xs tracking-widest cursor-pointer mb-5"
            >
                <ArrowLeft size={16} /> Back to Menu
            </button>

            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-5 sm:p-8 rounded-3xl shadow-sm mb-6 sm:mb-8">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase font-bold tracking-widest mb-1">
                        <ShieldAlert size={16} />
                        <span>Master Governance</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 dark:text-white tracking-tight">
                        Admin Control Center
                    </h1>
                </div>
                <button 
                    onClick={handleRefreshAll}
                    className="min-h-11 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
                >
                    <RefreshCcw size={14} className={loadingUsers || loadingGames || loadingLogs ? 'animate-spin' : ''} />
                    <span>Refresh All</span>
                </button>
            </div>

            {/* Top 3 Quick Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-3 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">Total Users</span>
                        <p className="text-lg sm:text-2xl font-black text-slate-950 dark:text-white tabular-nums mt-0.5">{totalElements}</p>
                    </div>
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800/60">
                        <Users size={18} />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-3 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">Active Sessions</span>
                        <p className="text-lg sm:text-2xl font-black text-slate-950 dark:text-white tabular-nums mt-0.5">{activeGames.length}</p>
                    </div>
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/60">
                        <Swords size={18} />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 p-3 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">Audit Logs</span>
                        <p className="text-lg sm:text-2xl font-black text-slate-950 dark:text-white tabular-nums mt-0.5">{auditTotalElements}</p>
                    </div>
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/60">
                        <FileText size={18} />
                    </div>
                </div>
            </div>

            {/* 4-Tab Navigation Bar */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6 p-1.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`min-h-11 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
                        activeTab === 'users'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                    <Users size={15} />
                    <span>Users ({totalElements})</span>
                </button>

                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`min-h-11 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
                        activeTab === 'sessions'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                    <Swords size={15} />
                    <span>Sessions ({activeGames.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('logs')}
                    className={`min-h-11 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
                        activeTab === 'logs'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                    <FileText size={15} />
                    <span>Logs ({auditTotalElements})</span>
                </button>

                <button
                    onClick={() => setActiveTab('sandbox')}
                    className={`min-h-11 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer ${
                        activeTab === 'sandbox'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                    <Wrench size={15} />
                    <span>Sandbox</span>
                </button>
            </div>

            {/* Tab Panels */}
            <div>
                {activeTab === 'users' && (
                    <UserManagementPanel 
                        users={users}
                        loading={loadingUsers}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        selectedCategory={userFilter}
                        onFilterChange={handleFilterChange}
                        onPageChange={setCurrentPage}
                        onDeleteUser={handleDeleteUser}
                    />
                )}

                {activeTab === 'sessions' && (
                    <ActiveGamesPanel 
                        activeGames={activeGames} 
                        loading={loadingGames} 
                        onForceFinish={handleForceFinish} 
                    />
                )}

                {activeTab === 'logs' && (
                    <AuditLogsPanel 
                        auditLogs={auditLogs}
                        loading={loadingLogs}
                        auditPage={auditPage}
                        auditTotalPages={auditTotalPages}
                        auditTotalElements={auditTotalElements}
                        onAuditPageChange={setAuditPage}
                    />
                )}

                {activeTab === 'sandbox' && (
                    <SandboxTriggerPanel onGameTriggered={fetchActiveGamesData} />
                )}
            </div>
        </div>
    );
}
