import { useState, useEffect, useCallback } from 'react';
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
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import SandboxTriggerPanel from './components/SandboxTriggerPanel';
import ActiveGamesPanel from './components/ActiveGamesPanel';
import UserManagementPanel from './components/UserManagementPanel';
import AuditLogsPanel from './components/AuditLogsPanel';

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

    const fetchUsersData = useCallback(async (page: number) => {
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
    }, [pageSize]);

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
        fetchUsersData(currentPage);
        fetchActiveGamesData();
        fetchAuditLogsData(auditPage);
    }, [currentPage, auditPage, fetchUsersData, fetchActiveGamesData, fetchAuditLogsData]);

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

    const handleRefreshAll = () => {
        fetchUsersData(currentPage);
        fetchActiveGamesData();
        fetchAuditLogsData(auditPage);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 w-full px-4 pt-36 pb-12">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-wider text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldAlert className="text-blue-500" /> ADMIN CONTROL CENTER
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System management, user auditing, and active game session panel.</p>
                </div>
                <button 
                    onClick={handleRefreshAll}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all text-slate-900 dark:text-white cursor-pointer"
                >
                    <RefreshCcw size={14} /> Refresh
                </button>
            </div>

            <SandboxTriggerPanel onGameTriggered={fetchActiveGamesData} />

            <ActiveGamesPanel 
                activeGames={activeGames} 
                loading={loadingGames} 
                onForceFinish={handleForceFinish} 
            />

            <UserManagementPanel 
                users={users}
                loading={loadingUsers}
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setCurrentPage}
                onDeleteUser={handleDeleteUser}
            />

            <AuditLogsPanel 
                auditLogs={auditLogs}
                loading={loadingLogs}
                auditPage={auditPage}
                auditTotalPages={auditTotalPages}
                auditTotalElements={auditTotalElements}
                onAuditPageChange={setAuditPage}
            />
        </div>
    );
}
