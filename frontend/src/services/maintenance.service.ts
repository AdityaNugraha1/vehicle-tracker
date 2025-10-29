// src/services/maintenance.service.ts - FRONTEND
import {api} from './api';
import type { Maintenance, PaginatedResponse, MaintenanceStats } from '../types';

export const maintenanceService = {
  async getMaintenance(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Maintenance>> {
    try {
      const response = await api.get(`/maintenance?page=${page}&limit=${limit}`);
      console.log('Maintenance response:', response.data);
      
      if (response.data.data && response.data.data.maintenance) {
        return {
          data: response.data.data.maintenance,
          pagination: response.data.data.pagination
        };
      } else {
        console.error('Unexpected maintenance response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Failed to fetch maintenance:', error);
      throw error;
    }
  },

  async createMaintenance(data: {
    vehicleId: string;
    type: string;
    description: string;
    cost?: number;
    date?: string;
  }) {
    try {
      console.log('Creating maintenance with data:', data);
      
      const response = await api.post('/maintenance', data);
      console.log('Create maintenance response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create maintenance error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to create maintenance');
    }
  },

  async completeMaintenance(maintenanceId: string) {
    try {
      console.log('Completing maintenance:', maintenanceId);
      
      const response = await api.patch(`/maintenance/${maintenanceId}/complete`);
      console.log('Complete maintenance response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Complete maintenance error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to complete maintenance');
    }
  },

  async startMaintenance(maintenanceId: string) {
    try {
      console.log('Starting maintenance:', maintenanceId);
      
      const response = await api.patch(`/maintenance/${maintenanceId}/start`);
      console.log('Start maintenance response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Start maintenance error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to start maintenance');
    }
  },

  async getMaintenanceStats(): Promise<MaintenanceStats> {
    try {
      const response = await api.get('/maintenance/stats');
      console.log('Maintenance stats response:', response.data);
      
      if (response.data.data && response.data.data.stats) {
        return response.data.data.stats;
      } else {
        throw new Error('Invalid stats response structure');
      }
    } catch (error) {
      console.error('Failed to fetch maintenance stats:', error);
      throw error;
    }
  }
};