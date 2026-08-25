import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center font-black uppercase text-xs tracking-widest text-slate-500">
                Loading Security Context...
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'ROLE_ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
