// src/App.tsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { Trips } from './pages/Trips';
import { MaintenancePage } from './pages/Maintenance';
import { ReportsPage } from './pages/Reports';
import { Login } from './pages/Login';
import { Map } from './pages/Map';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { ManageUsers } from './pages/ManageUsers';
import { useAuthStore } from './store/auth.store'; // 1. Import store

const queryClient = new QueryClient();

// 2. Perbarui 'ProtectedPage' untuk menerima 'adminOnly'
const ProtectedPage: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => (
  // 3. Teruskan 'adminOnly' ke ProtectedRoute
  <ProtectedRoute adminOnly={adminOnly}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  // 4. PANGGIL checkAuth() DI SINI, SATU KALI SAAT APP LOAD
  //    Ini akan meng-trigger pengecekan token
  React.useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rute Standar (Sintaks '}' yang salah sudah dihapus) */}
          <Route
            path="/dashboard"
            element={<ProtectedPage><Dashboard /></ProtectedPage>}
          />
          <Route
            path="/vehicles"
            element={<ProtectedPage><Vehicles /></ProtectedPage>}
          />
          <Route
            path="/trips"
            element={<ProtectedPage><Trips /></ProtectedPage>}
          />
          <Route
            path="/maintenance"
            element={<ProtectedPage><MaintenancePage /></ProtectedPage>}
          />
          <Route
            path="/reports"
            element={<ProtectedPage><ReportsPage /></ProtectedPage>}
          />
          <Route
            path="/map"
            element={<ProtectedPage><Map /></ProtectedPage>}
          />
          <Route
            path="/profile"
            element={<ProtectedPage><Profile /></ProtectedPage>}
          />

          {/* 5. RUTE ADMIN */}
          <Route
            path="/manage-users"
            element={
              <ProtectedPage adminOnly={true}>
                <ManageUsers />
              </ProtectedPage>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;