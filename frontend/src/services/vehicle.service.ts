// src/services/vehicle.service.ts - FRONTEND (FIXED)

import { api } from './api';
import type { Vehicle, PaginatedResponse, ApiResponse } from '../types';

export const vehicleService = {
  getVehicles: async (page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<Vehicle>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    try {
      // Backend (getVehicles) mengirim: { success: true, data: { data: [...], pagination: {...} } }
      const response = await api.get<ApiResponse<PaginatedResponse<Vehicle>>>(`/vehicles?${params}`);
      console.log('API Response (getVehicles):', response.data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch vehicles');
      }
      
      // Return data paginasi: { data: [...], pagination: {...} }
      return response.data.data;
    } catch (error) {
      console.error('API Error (getVehicles):', error);
      throw error;
    }
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    // Backend (getVehicle) mengirim: { success: true, data: { vehicle: {...} } }
    const response = await api.get<ApiResponse<{ vehicle: Vehicle }>>(`/vehicles/${id}`);
    
    if (!response.data.success || !response.data.data?.vehicle) {
      throw new Error(response.data.error || 'Failed to fetch vehicle');
    }
    
    return response.data.data.vehicle;
  },

  createVehicle: async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Vehicle> => {
    // Backend (createVehicle) mengirim: { success: true, data: { vehicle: {...} } }
    const response = await api.post<ApiResponse<{ vehicle: Vehicle }>>('/vehicles', vehicleData);
    
    if (!response.data.success || !response.data.data?.vehicle) {
      throw new Error(response.data.error || 'Failed to create vehicle');
    }
    
    return response.data.data.vehicle;
  },

  updateVehicle: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    // Backend (updateVehicle) mengirim: { success: true, data: { vehicle: {...} } }
    const response = await api.put<ApiResponse<{ vehicle: Vehicle }>>(`/vehicles/${id}`, vehicleData);
    
    if (!response.data.success || !response.data.data?.vehicle) {
      throw new Error(response.data.error || 'Failed to update vehicle');
    }
    
    return response.data.data.vehicle;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    // Backend (deleteVehicle) mengirim: { success: true }
    const response = await api.delete<ApiResponse>(`/vehicles/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete vehicle');
    }
  },

  getVehicleStats: async (): Promise<any> => {
    // Backend (getVehicleStats) mengirim: { success: true, data: { stats: {...} } }
    const response = await api.get<ApiResponse<{ stats: any }>>('/vehicles/stats');
    
    if (!response.data.success || !response.data.data?.stats) {
      throw new Error(response.data.error || 'Failed to fetch vehicle stats');
    }
    
    return response.data.data.stats;
  },

  /**
   * INI FUNGSI YANG DIPERBAIKI
   * Mengambil kendaraan yang 'AVAILABLE' untuk modal 'Start Trip'.
   * Backend mengirim respons sederhana: { success: true, data: [...] }
   * Komponen Trips.tsx mengharapkan objek { data: [...] }, jadi kita return response.data
   */
  async getAvailableVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      // Tentukan tipe respons yang diharapkan dari backend
      const response = await api.get<ApiResponse<Vehicle[]>>('/vehicles/available');
      console.log('Raw available vehicles response:', response.data);

      // Backend (getAvailableVehicles) mengirim: { success: true, data: [ ...Vehicle ] }
      
      // Periksa apakah 'success' adalah true dan 'data' adalah sebuah array
      if (response.data?.success && Array.isArray(response.data.data)) {
        
        // Kembalikan seluruh objek respons { success: true, data: [...] }
        // Komponen (Trips.tsx) akan mengakses 'response.data.data' untuk mendapatkan array
        return response.data;
        
      } else {
        // Ini terjadi jika struktur tidak cocok (misal: data bukan array)
        console.error('Unexpected available vehicles response structure:', response.data);
        throw new Error(response.data.error || 'Invalid response structure from server');
      }
    } catch (error: any) {
      console.error('Failed to fetch available vehicles:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to fetch available vehicles');
    }
  },

};