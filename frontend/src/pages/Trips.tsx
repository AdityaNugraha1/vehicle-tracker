// src/pages/Trips.tsx - Update dengan data yang sudah diperbaiki
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/trip.service';
import { vehicleService } from '../services/vehicle.service';
import type { Vehicle, Trip } from '../types';

export const Trips: React.FC = () => {
  const [page, setPage] = useState(1);
  const [showStartTripModal, setShowStartTripModal] = useState(false);
  const queryClient = useQueryClient();

  const { 
    data: tripsResponse, 
    isLoading: tripsLoading, 
    error: tripsError 
  } = useQuery({
    queryKey: ['trips', page],
    queryFn: () => tripService.getTrips(page, 10),
  });

  const { 
    data: availableVehiclesResponse, 
    isLoading: vehiclesLoading, 
    error: vehiclesError 
  } = useQuery({
    queryKey: ['available-vehicles'],
    queryFn: () => vehicleService.getAvailableVehicles(),
  });

  // Safe data extraction - sesuai struktur sebenarnya
  const tripsData = tripsResponse?.data || [];
  const tripsPagination = tripsResponse?.pagination;
  const availableVehicles = availableVehiclesResponse?.data || [];

  console.log('Processed trips data:', tripsData);
  console.log('Processed available vehicles:', availableVehicles);

  const startTripMutation = useMutation({
    mutationFn: tripService.startTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      queryClient.invalidateQueries({ queryKey: ['available-vehicles'] });
      setShowStartTripModal(false);
    },
    onError: (error) => {
      console.error('Failed to start trip:', error);
      alert('Failed to start trip: ' + error.message);
    }
  });

  const endTripMutation = useMutation({
    mutationFn: tripService.endTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      queryClient.invalidateQueries({ queryKey: ['available-vehicles'] });
    },
    onError: (error) => {
      console.error('Failed to end trip:', error);
      alert('Failed to end trip: ' + error.message);
    }
  });

  const handleStartTrip = (vehicleId: string) => {
    console.log('Starting trip for vehicle ID:', vehicleId);
    
    if (!vehicleId) {
      alert('Error: Vehicle ID is missing');
      return;
    }

    startTripMutation.mutate({
      vehicleId,
      startLat: -6.2088,
      startLng: 106.8456,
    });
  };

  const handleEndTrip = (tripId: string) => {
    console.log('Ending trip ID:', tripId);
    
    if (!tripId) {
      alert('Error: Trip ID is missing');
      return;
    }

    endTripMutation.mutate({
      tripId,
      endLat: -6.2297,
      endLng: 106.6894,
      distance: Math.floor(Math.random() * 100) + 10,
      fuelUsed: Math.floor(Math.random() * 20) + 5,
    });
  };

  if (tripsLoading || vehiclesLoading) {
    return <div className="flex justify-center p-8">Loading trips...</div>;
  }

  if (tripsError) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-red-600">
          Error loading trips: {tripsError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="text-gray-600">Manage and track vehicle trips</p>
          {vehiclesError && (
            <p className="text-yellow-600 text-sm mt-1">
              Warning: Cannot load available vehicles - {vehiclesError.message}
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowStartTripModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          disabled={vehiclesError !== null}
        >
          Start New Trip
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Vehicle</th>
                <th className="text-left py-3">Start Time</th>
                <th className="text-left py-3">End Time</th>
                <th className="text-left py-3">Distance</th>
                <th className="text-left py-3">Fuel Used</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Actions</th>
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
                  <td className="py-3">
                    {new Date(trip.startTime).toLocaleString()}
                  </td>
                  <td className="py-3">
                    {trip.endTime ? new Date(trip.endTime).toLocaleString() : '-'}
                  </td>
                  <td className="py-3">
                    {trip.distance ? `${trip.distance} km` : '-'}
                  </td>
                  <td className="py-3">
                    {trip.fuelUsed ? `${trip.fuelUsed} L` : '-'}
                  </td>
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
                  <td className="py-3">
                    {trip.status === 'ACTIVE' && (
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        onClick={() => handleEndTrip(trip.id)}
                        disabled={endTripMutation.isPending}
                      >
                        {endTripMutation.isPending ? 'Ending...' : 'End Trip'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tripsData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No trips found. Start a new trip to see them here.
          </div>
        )}

        {/* Pagination */}
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

      {/* Start Trip Modal */}
      {showStartTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Start New Trip</h2>
                <button 
                  onClick={() => setShowStartTripModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {vehiclesError ? (
                <div className="text-red-600 text-center py-4">
                  Cannot load available vehicles: {vehiclesError.message}
                </div>
              ) : (
                <div className="space-y-4">
                  {availableVehicles.map((vehicle: Vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{vehicle.licensePlate}</p>
                        <p className="text-sm text-gray-600">
                          {vehicle.brand} {vehicle.model} • Fuel: {vehicle.fuelLevel}%
                        </p>
                      </div>
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        onClick={() => handleStartTrip(vehicle.id)}
                        disabled={startTripMutation.isPending}
                      >
                        {startTripMutation.isPending ? 'Starting...' : 'Start Trip'}
                      </button>
                    </div>
                  ))}

                  {availableVehicles.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No available vehicles for trips
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};