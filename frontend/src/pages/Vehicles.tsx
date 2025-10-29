// src/pages/Vehicles.tsx - Update dengan complete CRUD
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle.service';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';
import { VehicleModal } from '../components/VehicleModal';
import { VehicleFormModal } from '../components/VehicleFormModal';
import type { Vehicle } from '../types';

export const Vehicles: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<Vehicle | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', page, search],
    queryFn: () => vehicleService.getVehicles(page, 10, search),
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      alert('Vehicle deleted successfully');
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete vehicle');
    },
  });

  const canManageVehicles = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDeleteVehicles = user?.role === 'ADMIN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ON_TRIP': return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
      case 'LOADING': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setEditingVehicle(null);
  };

  const handleDelete = (vehicle: Vehicle) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.licensePlate}?`)) {
      deleteVehicle.mutate(vehicle.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Error loading vehicles: {(error as any).message}
      </div>
    );
  }

  const vehicles = data?.data || [];
  const pagination = data?.pagination || { 
    page: 1, 
    limit: 10, 
    total: 0, 
    totalPages: 0 
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600">Manage your vehicle fleet</p>
        </div>
        
        {canManageVehicles && (
          <Button onClick={handleAdd}>
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License Plate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand & Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuel Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {vehicle.licensePlate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className="text-sm text-gray-500">{vehicle.color}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${vehicle.fuelLevel || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {vehicle.fuelLevel || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                    >
                      View
                    </button>
                    {canManageVehicles && (
                      <>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleEdit(vehicle)}
                        >
                          Edit
                        </button>
                        {canDeleteVehicles && (
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(vehicle)}
                            disabled={deleteVehicle.isPending}
                          >
                            {deleteVehicle.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
          <p className="text-gray-500 mt-2">
            {search ? 'Try adjusting your search terms' : 'Get started by adding your first vehicle'}
          </p>
        </div>
      )}

      {/* Modals */}
      <VehicleModal
        vehicleId={selectedVehicleId}
        isOpen={!!selectedVehicleId}
        onClose={() => setSelectedVehicleId(null)}
      />

      <VehicleFormModal
        vehicle={editingVehicle}
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingVehicle(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};