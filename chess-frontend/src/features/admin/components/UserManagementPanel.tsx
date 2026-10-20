import { useState, useMemo } from 'react';
import { Users, Trash2, ChevronLeft, ChevronRight, Search, Loader2, UserCheck, UserX } from 'lucide-react';
import { type AdminUserResponseDTO } from '../../../api/adminService';

interface UserManagementPanelProps {
    users: AdminUserResponseDTO[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    selectedCategory: 'all' | 'members' | 'guests';
    onFilterChange: (category: 'all' | 'members' | 'guests') => void;
    onPageChange: (page: number) => void;
    onDeleteUser: (id: number) => void;
}

export default function UserManagementPanel({
    users,
    loading,
    currentPage,
    totalPages,
    totalElements,
    selectedCategory,
    onFilterChange,
    onPageChange,
    onDeleteUser
}: UserManagementPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return users;
        return users.filter(u => 
            u.username.toLowerCase().includes(q) || 
            (u.email && u.email.toLowerCase().includes(q)) || 
            (u.role && u.role.toLowerCase().includes(q))
        );
    }, [users, searchQuery]);

    return (
        <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 sm:p-7 shadow-sm">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">
                        Registered Operatives ({totalElements})
                    </h2>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by name, email..."
                        className="w-full min-h-11 pl-9 pr-4 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                </div>
            </div>

            {/* Sub-Filters: All Users | Registered Members | Guest Accounts */}
            <div className="flex flex-wrap gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
                <button
                    type="button"
                    onClick={() => onFilterChange('all')}
                    className={`min-h-9 px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCategory === 'all'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                    <Users size={13} />
                    <span>All Users</span>
                </button>

                <button
                    type="button"
                    onClick={() => onFilterChange('members')}
                    className={`min-h-9 px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCategory === 'members'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                    <UserCheck size={13} />
                    <span>Registered Members</span>
                </button>

                <button
                    type="button"
                    onClick={() => onFilterChange('guests')}
                    className={`min-h-9 px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCategory === 'guests'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                    <UserX size={13} />
                    <span>Guest Accounts</span>
                </button>
            </div>

            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">Loading Users...</span>
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80">
                        <table className="w-full text-left text-xs border-collapse table-fixed sm:table-auto">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 uppercase font-black tracking-wider text-[10px]">
                                    <th className="hidden sm:table-cell py-3 px-4 w-16">ID</th>
                                    <th className="py-3 px-3 sm:px-4">Operative</th>
                                    <th className="hidden md:table-cell py-3 px-4">Email</th>
                                    <th className="py-3 px-2 sm:px-4 text-center sm:text-left w-24 sm:w-auto">Role</th>
                                    <th className="py-3 px-3 sm:px-4 text-right w-16 sm:w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-bold">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="hidden sm:table-cell py-3 px-4 text-slate-500 font-mono text-[11px]">#{u.id}</td>
                                            <td className="py-3 px-3 sm:px-4">
                                                <span className="text-slate-950 dark:text-white font-black truncate block text-xs sm:text-sm">
                                                    {u.username}
                                                </span>
                                                <span className="block md:hidden text-[10px] text-slate-500 font-mono truncate max-w-28 sm:max-w-44">
                                                    {u.email || 'No email'}
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate max-w-48">
                                                {u.email || 'N/A'}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-center sm:text-left">
                                                <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                                                    u.role === 'ROLE_ADMIN' 
                                                        ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                                                        : u.role === 'ROLE_GUEST' || u.username.startsWith('guest_')
                                                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                                                        : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400'
                                                }`}>
                                                    {u.role ? u.role.replace('ROLE_', '') : 'USER'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 sm:px-4 text-right">
                                                <button 
                                                    onClick={() => onDeleteUser(u.id)}
                                                    disabled={u.role === 'ROLE_ADMIN'}
                                                    className="w-8 h-8 inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-slate-500 text-xs uppercase tracking-wider">
                                            No operatives match criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                            <button
                                onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
                                disabled={currentPage === 0}
                                className="min-h-11 flex items-center gap-1 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-black uppercase tracking-wider transition-colors text-slate-900 dark:text-white cursor-pointer"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>

                            <span className="text-[11px] sm:text-xs font-black uppercase text-slate-500">
                                {currentPage + 1} / {totalPages}
                            </span>

                            <button
                                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
                                disabled={currentPage === totalPages - 1}
                                className="min-h-11 flex items-center gap-1 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-black uppercase tracking-wider transition-colors text-slate-900 dark:text-white cursor-pointer"
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
