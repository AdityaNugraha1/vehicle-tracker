// src/services/trip.service.ts - FRONTEND
import {api} from './api';
import type { Trip, PaginatedResponse } from '../types';

export const tripService = {
  async getTrips(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Trip>> {
    try {
      const response = await api.get(`/vehicles/trips/all?page=${page}&limit=${limit}`);
      console.log('Raw trips response:', response.data);
      
      // Handle backend response structure: { success: true, data: { trips: [], pagination: {} } }
      if (response.data.data && Array.isArray(response.data.data.trips)) {
        return {
          data: response.data.data.trips,
          pagination: response.data.data.pagination
        };
      } else {
        console.error('Unexpected trips response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      throw error;
    }
  },

  async startTrip(data: {
    vehicleId: string;
    startLat: number;
    startLng: number;
  }) {
    try {
      console.log('Starting trip with data:', data);
      
      // Sesuai dengan backend - TANPA estimatedDistance
      const requestData = {
        startLat: data.startLat,
        startLng: data.startLng
      };
      
      console.log('Sending request to:', `/vehicles/${data.vehicleId}/trips/start`);
      console.log('Request payload:', requestData);
      
      const response = await api.post(`/vehicles/${data.vehicleId}/trips/start`, requestData);
      
      console.log('Start trip response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Start trip error details:', {
        url: `/vehicles/${data.vehicleId}/trips/start`,
        payload: { startLat: data.startLat, startLng: data.startLng },
        status: error.response?.status,
        errorData: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to start trip');
    }
  },

  async endTrip(data: {
    tripId: string;
    endLat: number;
    endLng: number;
    distance: number;
    fuelUsed: number;
  }) {
    try {
      console.log('Ending trip with data:', data);
      
      const response = await api.patch(`/vehicles/trips/${data.tripId}/end`, {
        endLat: data.endLat,
        endLng: data.endLng,
        distance: data.distance,
        fuelUsed: data.fuelUsed
      });
      
      console.log('End trip response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('End trip error details:', {
        status: error.response?.status,
        errorData: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to end trip');
    }
  }
};