// src/components/VehicleFormModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle.service';
import type { Vehicle } from '../types';
import { Button } from './ui/Button';

const vehicleSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(2000, 'Year must be after 2000').max(new Date().getFullYear() + 1, 'Invalid year'),
  color: z.string().min(1, 'Color is required'),
  fuelLevel: z.number().min(0).max(100).optional(),
  odometer: z.number().min(0).optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormModalProps {
  vehicle?: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const isEdit = !!vehicle;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle ? {
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      fuelLevel: vehicle.fuelLevel,
      odometer: vehicle.odometer,
    } : undefined,
  });

  const createVehicle = useMutation({
    mutationFn: (data: VehicleFormData) => vehicleService.createVehicle({
      ...data,
      status: 'AVAILABLE' // Tambahkan status default
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onClose();
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to create vehicle');
    },
  });

  const updateVehicle = useMutation({
    mutationFn: (data: VehicleFormData) => vehicleService.updateVehicle(vehicle!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle!.id] });
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update vehicle');
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    if (isEdit) {
      updateVehicle.mutate(data);
    } else {
      createVehicle.mutate(data);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate *
              </label>
              <input
                {...register('licensePlate')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="B 1234 CD"
              />
              {errors.licensePlate && (
                <p className="text-red-500 text-sm mt-1">{errors.licensePlate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  {...register('brand')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Toyota"
                />
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  {...register('model')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hiace"
                />
                {errors.model && (
                  <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  {...register('year', { valueAsNumber: true })}
                  type="number"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2023"
                />
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <input
                  {...register('color')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="White"
                />
                {errors.color && (
                  <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Level (%)
                </label>
                <input
                  {...register('fuelLevel', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
                {errors.fuelLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.fuelLevel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer (km)
                </label>
                <input
                  {...register('odometer', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                {errors.odometer && (
                  <p className="text-red-500 text-sm mt-1">{errors.odometer.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createVehicle.isPending || updateVehicle.isPending}
              >
                {isEdit ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};