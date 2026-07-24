import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getMyProfile, type UserResponse } from '../../api/userService';

interface ProtectedRouteProps {
    requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const data = await getMyProfile();
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user profile for route protection:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>Loading...</div>;
    }

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'ROLE_ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
