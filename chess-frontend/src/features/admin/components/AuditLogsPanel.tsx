import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { type AdminAuditLogResponseDTO } from '../../../api/adminService';

interface AuditLogsPanelProps {
    auditLogs: AdminAuditLogResponseDTO[];
    loading: boolean;
    auditPage: number;
    auditTotalPages: number;
    auditTotalElements: number;
    onAuditPageChange: (page: number) => void;
}

export default function AuditLogsPanel({
    auditLogs,
    loading,
    auditPage,
    auditTotalPages,
    auditTotalElements,
    onAuditPageChange
}: AuditLogsPanelProps) {
    return (
        <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <FileText size={20} /> Audit Logs ({auditTotalElements})
                </h2>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Page {auditPage + 1} of {auditTotalPages}
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
                                onClick={() => onAuditPageChange(Math.max(auditPage - 1, 0))}
                                disabled={auditPage === 0}
                                className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-slate-900 dark:text-white cursor-pointer"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: auditTotalPages }, (_, i) => i).map((pageIndex) => (
                                    <button
                                        key={pageIndex}
                                        onClick={() => onAuditPageChange(pageIndex)}
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
                                onClick={() => onAuditPageChange(Math.min(auditPage + 1, auditTotalPages - 1))}
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
    );
}
