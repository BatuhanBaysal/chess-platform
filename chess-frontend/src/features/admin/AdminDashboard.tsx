import React, { useState, useEffect } from 'react';
import { 
    getAllUsers, 
    deleteUserAccount, 
    getActiveGames, 
    forceFinishGame, 
    triggerSandboxGame, 
    getAuditLogs,
    type AdminUserResponseDTO, 
    type AdminActiveGameResponseDTO,
    type AdminAuditLogResponseDTO
} from '../../api/adminService';
import { 
    Users, PlaySquare, Terminal, Trash2, ShieldAlert, 
    RefreshCcw, ChevronLeft, ChevronRight, Play, FileText 
} from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState<AdminUserResponseDTO[]>([]);
    const [activeGames, setActiveGames] = useState<AdminActiveGameResponseDTO[]>([]);
    const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponseDTO[]>([]);
    
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingGames, setLoadingGames] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [currentPage, setCurrentPage] = useState<number>(0); 
    const [pageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(0);

    const [auditPage, setAuditPage] = useState<number>(0);
    const [auditTotalPages, setAuditTotalPages] = useState<number>(1);
    const [auditTotalElements, setAuditTotalElements] = useState<number>(0);

    const [whiteId, setWhiteId] = useState<string>('');
    const [blackId, setBlackId] = useState<string>('');
    const [sandboxLoading, setSandboxLoading] = useState(false);

    const fetchUsersData = async (page: number) => {
        setLoadingUsers(true);
        try {
            const data = await getAllUsers(page, pageSize); 
            setUsers(data.content);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || data.content.length);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchActiveGamesData = async () => {
        setLoadingGames(true);
        try {
            const data = await getActiveGames();
            setActiveGames(data);
        } catch (error) {
            console.error("Failed to fetch active games:", error);
        } finally {
            setLoadingGames(false);
        }
    };

    const fetchAuditLogsData = async (page: number) => {
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
    };

    useEffect(() => {
        fetchUsersData(currentPage);
        fetchActiveGamesData();
        fetchAuditLogsData(auditPage);
    }, [currentPage, auditPage]);

    const handleDeleteUser = async (id: number) => {
        if (window.confirm("Are you sure you want to permanently delete this user account?")) {
            try {
                await deleteUserAccount(id);
                fetchUsersData(currentPage);
                fetchAuditLogsData(auditPage);
            } catch (error) {
                console.error("Failed to delete user:", error);
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

    const handleTriggerSandbox = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!whiteId || !blackId) return;
        setSandboxLoading(true);
        try {
            await triggerSandboxGame(Number(whiteId), Number(blackId));
            alert("Sandbox game triggered successfully!");
            fetchActiveGamesData();
        } catch (error) {
            console.error("Sandbox trigger failed:", error);
        } finally {
            setSandboxLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 w-full px-4 pt-8">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-wider text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldAlert className="text-blue-500" /> ADMIN CONTROL CENTER
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System management, user auditing, and active game session panel.</p>
                </div>
                <button 
                    onClick={() => { fetchUsersData(currentPage); fetchActiveGamesData(); fetchAuditLogsData(auditPage); }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all text-slate-900 dark:text-white cursor-pointer"
                >
                    <RefreshCcw size={14} /> Refresh
                </button>
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
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
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                    <PlaySquare size={20} /> Active Game Sessions ({activeGames.length})
                </h2>
                {loadingGames ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                ) : activeGames.length === 0 ? (
                    <p className="text-sm text-slate-500">No active game sessions found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                           <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="py-3 px-4">Game ID</th>
                                    <th className="py-3 px-4">White Player</th>
                                    <th className="py-3 px-4">Black Player</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                                {activeGames.map((game: AdminActiveGameResponseDTO) => {
                                    const whiteDisplay = game.whitePlayerId ? `User #${game.whitePlayerId}` : 'N/A';
                                    const blackDisplay = game.blackPlayerId ? `User #${game.blackPlayerId}` : 'N/A';

                                    return (
                                        <tr key={game.gameId} className="hover:bg-slate-100 dark:hover:bg-slate-800/20">
                                            <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">{game.gameId}</td>
                                            <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{whiteDisplay}</td>
                                            <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{blackDisplay}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                                    {game.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button 
                                                    onClick={() => handleForceFinish(game.gameId)}
                                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                                >
                                                    Force Finish
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Users size={20} /> Registered Users ({totalElements})
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                </div>

                {loadingUsers ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Username</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                                    {users.length > 0 ? (
                                        users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/20">
                                                <td className="py-3 px-4 text-slate-500">#{u.id}</td>
                                                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{u.username}</td>
                                                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                        u.role === 'ROLE_ADMIN' 
                                                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                                                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        disabled={u.role === 'ROLE_ADMIN'}
                                                        className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-red-500/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 rounded-xl transition-all cursor-pointer"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-slate-500 text-xs uppercase tracking-wider">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                    disabled={currentPage === 0}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-slate-900 dark:text-white cursor-pointer"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i).map((pageIndex) => (
                                        <button
                                            key={pageIndex}
                                            onClick={() => setCurrentPage(pageIndex)}
                                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                currentPage === pageIndex 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {pageIndex + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-slate-900 dark:text-white cursor-pointer"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <FileText size={20} /> Audit Logs ({auditTotalElements})
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Page {auditPage + 1} of {auditTotalPages}
                    </span>
                </div>

                {loadingLogs ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Admin ID</th>
                                        <th className="py-3 px-4">Action Type</th>
                                        <th className="py-3 px-4">Details</th>
                                        <th className="py-3 px-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                                    {auditLogs.length > 0 ? (
                                        auditLogs.map((log: AdminAuditLogResponseDTO) => (
                                            <tr key={log.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/20">
                                                <td className="py-3 px-4 text-slate-500 font-mono text-xs">#{log.id}</td>
                                                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.adminId ?? 'N/A'}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold">
                                                        {log.actionType}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{log.details}</td>
                                                <td className="py-3 px-4 text-slate-500 text-xs">
                                                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-slate-500 text-xs uppercase tracking-wider">
                                                No audit logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {auditTotalPages > 1 && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setAuditPage(prev => Math.max(prev - 1, 0))}
                                    disabled={auditPage === 0}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-slate-900 dark:text-white cursor-pointer"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: auditTotalPages }, (_, i) => i).map((pageIndex) => (
                                        <button
                                            key={pageIndex}
                                            onClick={() => setAuditPage(pageIndex)}
                                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                auditPage === pageIndex 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {pageIndex + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setAuditPage(prev => Math.min(prev + 1, auditTotalPages - 1))}
                                    disabled={auditPage === auditTotalPages - 1}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-slate-900 dark:text-white cursor-pointer"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
}
