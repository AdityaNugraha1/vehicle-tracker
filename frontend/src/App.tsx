// src/App.tsx - DIPERBAIKI
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { Trips } from './pages/Trips';
import { MaintenancePage } from './pages/Maintenance';
import { ReportsPage } from './pages/Reports';
import { Login } from './pages/Login';
import { Map } from './pages/Map'; // 1. Import halaman Map

const queryClient = new QueryClient();

// Komponen helper untuk menyederhanakan rute yang dilindungi + layout
const ProtectedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
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
          
          {/* 2. Tambahkan rute untuk /map */}
          <Route
            path="/map"
            element={<ProtectedPage><Map /></ProtectedPage>}
          />

        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;