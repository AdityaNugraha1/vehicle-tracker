// src/pages/Dashboard.tsx - DIPERBAIKI
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { vehicleService } from '../services/vehicle.service';
import { tripService } from '../services/trip.service'; // 1. Import tripService
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import type { Trip } from '../types'; // 2. Import Tipe Trip

// Helper Ikon untuk Aktivitas (Opsional)
const ActivityIcon: React.FC<{ status: Trip['status'] }> = ({ status }) => {
  if (status === 'COMPLETED') {
    return (
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <span className="text-green-600 text-sm">✓</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
      <span className="text-yellow-600 text-sm">...</span>
    </div>
  );
};

// Helper format waktu (Opsional, tapi bagus)
const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};


export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Query untuk Statistik Kendaraan (Sudah Benar)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vehicle-stats'],
    queryFn: () => vehicleService.getVehicleStats(),
  });

  // 3. Query baru untuk mengambil 5 aktivitas/trip terbaru
  const { data: recentTripsResponse, isLoading: tripsLoading } = useQuery({
    queryKey: ['recent-trips'],
    queryFn: () => tripService.getTrips(1, 5), // Ambil Halaman 1, 5 item
  });

  // Ambil data array dari respons paginasi
  const recentTrips = recentTripsResponse?.data || [];

  const StatCard: React.FC<{ title: string; value: number; color: string; icon: string }> = ({ 
    title, value, color, icon 
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {statsLoading ? '...' : value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Here's an overview of your vehicle fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Vehicles"
          value={stats?.totalVehicles || 0}
          color="bg-blue-500"
          icon="V"
        />
        <StatCard
          title="Available"
          value={stats?.availableVehicles || 0}
          color="bg-green-500"
          icon="A"
        />
        <StatCard
          title="On Trip"
          value={stats?.onTripVehicles || 0}
          color="bg-yellow-500"
          icon="O"
        />
        <StatCard
          title="Maintenance"
          value={stats?.maintenanceVehicles || 0}
          color="bg-red-500"
          icon="M"
        />
      </div>

      {/* 4. QUICK ACTIONS DIPERBAIKI */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            <Link to="/vehicles">
              <Button className="w-full">
                View All Vehicles
              </Button>
            </Link>

            {/* Asumsi Anda punya halaman /reports */}
            <Link to="/reports">
              <Button variant="outline" className="w-full">
                Generate Report
              </Button>
            </Link>
            
            {/* Asumsi Anda punya halaman /map */}
            <Link to="/map">
              <Button variant="outline" className="w-full">
                Track Vehicles
              </Button>
            </Link>

            {/* Asumsi Anda punya halaman /maintenance */}
            <Link to="/maintenance">
              <Button variant="outline" className="w-full">
                Maintenance
              </Button>
            </Link>

          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY DIPERBAIKI (DIBUAT DINAMIS) */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tripsLoading ? (
              <li className="px-6 py-4 text-center text-gray-500">Loading recent activity...</li>
            ) : recentTrips.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">No recent activity found.</li>
            ) : (
              recentTrips.map((trip: Trip) => (
                <li key={trip.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ActivityIcon status={trip.status} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {trip.status === 'ACTIVE' ? 'Trip Started:' : 'Trip Completed:'}
                          <span className="font-normal text-gray-800 ml-1">
                            {trip.vehicle.licensePlate} ({trip.vehicle.brand})
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {timeAgo(trip.startTime)}
                          {trip.status === 'COMPLETED' && trip.distance && (
                            <span className="ml-2"> • {trip.distance} km</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};