// src/pages/Maintenance.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../services/maintenance.service';
import { MaintenanceFormModal } from '../components/MaintenanceFormModal';
import type { Maintenance } from '../types';

export const MaintenancePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: maintenanceResponse, isLoading } = useQuery({
    queryKey: ['maintenance', page],
    queryFn: () => maintenanceService.getMaintenance(page, 10),
  });

  const { data: stats } = useQuery({
    queryKey: ['maintenance-stats'],
    queryFn: () => maintenanceService.getMaintenanceStats(),
  });

  const startMaintenanceMutation = useMutation({
    mutationFn: maintenanceService.startMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-stats'] });
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to start maintenance');
    }
  });

  const completeMaintenanceMutation = useMutation({
    mutationFn: maintenanceService.completeMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to complete maintenance');
    }
  });

  const maintenanceData = maintenanceResponse?.data || [];
  const maintenancePagination = maintenanceResponse?.pagination;

  const handleStartMaintenance = (maintenanceId: string) => {
    if (!window.confirm('Start this maintenance?')) return;
    startMaintenanceMutation.mutate(maintenanceId);
  };

  const handleCompleteMaintenance = (maintenanceId: string) => {
    if (!window.confirm('Complete this maintenance?')) return;
    completeMaintenanceMutation.mutate(maintenanceId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'ROUTINE_CHECK': 'Routine Check',
      'OIL_CHANGE': 'Oil Change',
      'TIRE_REPLACEMENT': 'Tire Replacement',
      'BRAKE_SERVICE': 'Brake Service',
      'ENGINE_REPAIR': 'Engine Repair',
      'OTHER': 'Other'
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading maintenance records...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600">Manage vehicle maintenance schedules</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Schedule Maintenance
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalMaintenance}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Scheduled</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.scheduledMaintenance}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.inProgressMaintenance}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedMaintenance}</p>
          </div>
        </div>
      )}

      {/* Maintenance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Vehicle</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Cost</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceData.map((maintenance: Maintenance) => (
                <tr key={maintenance.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{maintenance.vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-600">
                        {maintenance.vehicle.brand} {maintenance.vehicle.model}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{getTypeLabel(maintenance.type)}</span>
                  </td>
                  <td className="p-3">
                    {new Date(maintenance.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <p className="text-sm max-w-xs truncate" title={maintenance.description}>
                      {maintenance.description}
                    </p>
                  </td>
                  <td className="p-3">
                    {maintenance.cost ? (
                      <span className="font-medium">
                        Rp {maintenance.cost.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(maintenance.status)}`}>
                      {maintenance.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      {maintenance.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleStartMaintenance(maintenance.id)}
                          disabled={startMaintenanceMutation.isPending}
                          className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {maintenance.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleCompleteMaintenance(maintenance.id)}
                          disabled={completeMaintenanceMutation.isPending}
                          className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {maintenanceData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No maintenance records found. Schedule a maintenance to get started.
          </div>
        )}

        {/* Pagination */}
        {maintenancePagination && maintenancePagination.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {maintenancePagination.totalPages}
            </span>
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              disabled={page === maintenancePagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Maintenance Modal */}
      <MaintenanceFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};
