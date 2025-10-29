// src/components/Layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button } from './ui/Button';
// 1. Kita tidak perlu import UserRole karena kita akan cek string literal

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Vehicles', href: '/vehicles' },
  { name: 'Trips', href: '/trips' },
  { name: 'Map', href: '/map' },
  { name: 'Maintenance', href: '/maintenance' },
  { name: 'Reports', href: '/reports' },
];

// 2. Definisikan navigasi admin secara terpisah
const adminNavigation = [
  { name: 'Manage Users', href: '/manage-users' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // 3. Cek apakah user yang login adalah ADMIN (menggunakan string literal)
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Vehicle Tracker
              </h1>
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                {/* Navigasi Standar */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname.startsWith(item.href)
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* 4. Tampilkan navigasi admin HANYA jika isAdmin true */}
                {isAdmin &&
                  adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname.startsWith(item.href)
                          ? 'text-red-700 bg-red-50' // Warna berbeda untuk admin
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
              </div>
            </div>

            {/* Bagian User (Tidak berubah) */}
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 p-2 rounded-md"
                title="Edit Profile"
              >
                {user?.name} ({user?.role})
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};