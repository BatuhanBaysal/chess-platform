import { FileText, Loader2 } from 'lucide-react';
import { type AdminAuditLogResponseDTO } from '../../../api/adminService';
import Pagination from '../../../components/ui/Pagination';

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
        <div className="bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 sm:p-7 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-amber-600 dark:text-amber-400" />
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">
                        Audit Logs ({auditTotalElements})
                    </h2>
                </div>
            </div>

            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin text-amber-600" size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">Streaming Logs...</span>
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 uppercase font-black tracking-wider text-[10px]">
                                    <th className="hidden sm:table-cell py-3 px-4 w-16">ID</th>
                                    <th className="py-3 px-3 sm:px-4 w-32 sm:w-40">Action</th>
                                    <th className="py-3 px-3 sm:px-4">Details</th>
                                    <th className="hidden sm:table-cell py-3 px-4 text-right w-36">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-bold">
                                {auditLogs && auditLogs.length > 0 ? (
                                    auditLogs.map((log: AdminAuditLogResponseDTO) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="hidden sm:table-cell py-3 px-4 text-slate-500 font-mono text-[11px]">
                                                #{log.id}
                                            </td>
                                            <td className="py-3 px-3 sm:px-4">
                                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-md text-[10px] font-black uppercase inline-block">
                                                    {log.actionType}
                                                </span>
                                                <div className="flex sm:hidden items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-mono font-medium">
                                                    <span>
                                                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {log.adminId != null && <span>• Admin #{log.adminId}</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 sm:px-4 text-slate-950 dark:text-white font-medium text-xs wrap-break-words">
                                                {log.details}
                                            </td>
                                            <td className="hidden sm:table-cell py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                                                {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="sm:hidden text-center py-10 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                            No audit trail recorded.
                                        </td>
                                        <td colSpan={4} className="hidden sm:table-cell text-center py-10 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                            No audit trail recorded.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5">
                        <Pagination
                            currentPage={auditPage + 1}
                            totalPages={auditTotalPages}
                            onPageChange={(page) => onAuditPageChange(page - 1)}
                            disabled={loading}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
