import { Users, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { type AdminUserResponseDTO } from '../../../api/adminService';

interface UserManagementPanelProps {
    users: AdminUserResponseDTO[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onDeleteUser: (id: number) => void;
}

export default function UserManagementPanel({
    users,
    loading,
    currentPage,
    totalPages,
    totalElements,
    onPageChange,
    onDeleteUser
}: UserManagementPanelProps) {
    return (
        <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Users size={20} /> Registered Users ({totalElements})
                </h2>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Page {currentPage + 1} of {totalPages}
                </span>
            </div>

            {loading ? (
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
                                                    onClick={() => onDeleteUser(u.id)}
                                                    disabled={u.role === 'ROLE_ADMIN'}
                                                    className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-red-500/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-35 rounded-xl transition-all cursor-pointer"
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
                                onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
                                disabled={currentPage === 0}
                                className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-slate-900 dark:text-white cursor-pointer"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i).map((pageIndex) => (
                                    <button
                                        key={pageIndex}
                                        onClick={() => onPageChange(pageIndex)}
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
                                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
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
    );
}
