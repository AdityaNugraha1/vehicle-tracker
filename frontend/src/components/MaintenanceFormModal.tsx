import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../services/maintenance.service';
import { vehicleService } from '../services/vehicle.service';
import type { Vehicle } from '../types';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAINTENANCE_TYPES = [
  { value: 'ROUTINE_CHECK', label: 'Routine Check' },
  { value: 'OIL_CHANGE', label: 'Oil Change' },
  { value: 'TIRE_REPLACEMENT', label: 'Tire Replacement' },
  { value: 'BRAKE_SERVICE', label: 'Brake Service' },
  { value: 'ENGINE_REPAIR', label: 'Engine Repair' },
  { value: 'OTHER', label: 'Other' }
];

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'ROUTINE_CHECK',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-for-maintenance'],
    queryFn: () => vehicleService.getVehicles(1, 100, ''),
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: maintenanceService.createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-stats'] });
      onClose();
      setFormData({
        vehicleId: '',
        type: 'ROUTINE_CHECK',
        description: '',
        cost: '',
        date: new Date().toISOString().split('T')[0]
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to schedule maintenance');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    createMaintenanceMutation.mutate({
      vehicleId: formData.vehicleId,
      type: formData.type,
      description: formData.description,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      date: formData.date
    });
  };

  const handleClose = () => {
    setFormData({
      vehicleId: '',
      type: 'ROUTINE_CHECK',
      description: '',
      cost: '',
      date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Schedule Maintenance</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles?.data.map((vehicle: Vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {MAINTENANCE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the maintenance required..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (IDR)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMaintenanceMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {createMaintenanceMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};