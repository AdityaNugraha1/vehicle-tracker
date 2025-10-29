// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  // 1. Ambil 'isAuthLoading' (bukan isLoading), 'isAuthenticated', dan 'user'
  const { isAuthenticated, isAuthLoading, user } = useAuthStore();
  const location = useLocation();

  // 2. Cek HANYA 'isAuthLoading'
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 3. Cek 'isAuthenticated' SETELAH loading selesai
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Cek role Admin
  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Render children (Halaman Anda)
  //    (Looping tidak akan terjadi lagi karena halaman Anda hanya mengubah 'isLoading'
  //     dan 'ProtectedRoute' hanya mendengarkan 'isAuthLoading')
  return <>{children}</>;
};