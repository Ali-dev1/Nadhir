import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'customer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { userProfile, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center bg-ivory">
        <div className="w-8 h-8 rounded-full border-t-2 border-gold animate-spin"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && userProfile.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-ivory text-charcoal space-y-4">
        <h1 className="text-4xl font-serif text-red-600">403</h1>
        <h2 className="text-2xl font-serif">Unauthorized Access</h2>
        <p className="text-charcoal/60">You do not have permission to view this command center.</p>
        <a href="/" className="btn-primary py-2 px-6 mt-4 inline-block">Return to Storefront</a>
      </div>
    );
  }

  return <Outlet />;
};
