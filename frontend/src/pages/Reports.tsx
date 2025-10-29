// src/pages/Reports.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripService } from '../services/trip.service';
import { vehicleService } from '../services/vehicle.service';
import type { Trip, Vehicle } from '../types';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles'>('trips');
  const [page, setPage] = useState(1);

  // Query untuk laporan trip
  const {
    data: tripsResponse,
    isLoading: tripsLoading,
    error: tripsError,
  } = useQuery({
    queryKey: ['reports-trips', page],
    queryFn: () => tripService.getTrips(page, 10),
    enabled: activeTab === 'trips',
  });

  // Query untuk laporan kendaraan
  const {
    data: vehiclesResponse,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useQuery({
    queryKey: ['reports-vehicles', page],
    queryFn: () => vehicleService.getVehicles(page, 10),
    enabled: activeTab === 'vehicles',
  });

  const tripsData = tripsResponse?.data || [];
  const tripsPagination = tripsResponse?.pagination;
  const vehiclesData = vehiclesResponse?.data || [];
  const vehiclesPagination = vehiclesResponse?.pagination;

  const renderTripsReport = () => {
    if (tripsLoading) return <div className="text-center p-8">Loading trip reports...</div>;
    if (tripsError) return <div className="text-red-600 p-6">Error: {tripsError.message}</div>;

    return (
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Trip Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left">Vehicle</th>
                <th className="py-3 text-left">Start Time</th>
                <th className="py-3 text-left">End Time</th>
                <th className="py-3 text-left">Distance</th>
                <th className="py-3 text-left">Fuel Used</th>
                <th className="py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tripsData.map((trip: Trip) => (
                <tr key={trip.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{trip.vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-600">
                        {trip.vehicle.brand} {trip.vehicle.model}
                      </p>
                    </div>
                  </td>
                  <td className="py-3">{new Date(trip.startTime).toLocaleString()}</td>
                  <td className="py-3">
                    {trip.endTime ? new Date(trip.endTime).toLocaleString() : '-'}
                  </td>
                  <td className="py-3">{trip.distance ? `${trip.distance} km` : '-'}</td>
                  <td className="py-3">{trip.fuelUsed ? `${trip.fuelUsed} L` : '-'}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        trip.status === 'ACTIVE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tripsData.length === 0 && (
          <div className="text-center py-8 text-gray-500">No trip reports available.</div>
        )}

        {tripsPagination && tripsPagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {tripsPagination.totalPages}
            </span>
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              disabled={page === tripsPagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderVehiclesReport = () => {
    if (vehiclesLoading) return <div className="text-center p-8">Loading vehicle reports...</div>;
    if (vehiclesError) return <div className="text-red-600 p-6">Error: {vehiclesError.message}</div>;

    return (
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Vehicle Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left">License Plate</th>
                <th className="py-3 text-left">Brand</th>
                <th className="py-3 text-left">Model</th>
                <th className="py-3 text-left">Year</th>
                <th className="py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesData.map((vehicle: Vehicle) => (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{vehicle.licensePlate}</td>
                  <td className="py-3">{vehicle.brand}</td>
                  <td className="py-3">{vehicle.model}</td>
                  <td className="py-3">{vehicle.year}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        vehicle.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'ON_TRIP'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vehiclesData.length === 0 && (
          <div className="text-center py-8 text-gray-500">No vehicle reports available.</div>
        )}

        {vehiclesPagination && vehiclesPagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {vehiclesPagination.totalPages}
            </span>
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              disabled={page === vehiclesPagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View reports for trips and vehicles.</p>
        </div>
        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'trips'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('trips')}
          >
            Trip Reports
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'vehicles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('vehicles')}
          >
            Vehicle Reports
          </button>
        </div>
      </div>

      {activeTab === 'trips' ? renderTripsReport() : renderVehiclesReport()}
    </div>
  );
};
