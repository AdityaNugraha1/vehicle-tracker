// src/components/Layout.tsx - Update navigation
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Vehicles', href: '/vehicles', icon: '🚗' },
  { name: 'Trips', href: '/trips', icon: '🛣️' },
  { name: 'Maintenance', href: '/maintenance', icon: '🔧' },
  { name: 'Reports', href: '/reports', icon: '📈' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

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
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name} ({user?.role})
              </span>
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