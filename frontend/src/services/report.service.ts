// src/services/report.service.ts
import { api } from './api';
import type { ApiResponse } from '../types';

export interface ReportRequest {
  startDate: string;
  endDate: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  filePath: string;
  createdAt: string;
  downloadUrl: string;
}

export const reportService = {
  generateVehicleUtilizationReport: async (dateRange: ReportRequest): Promise<GeneratedReport> => {
    const response = await api.post<ApiResponse<{ report: GeneratedReport; downloadUrl: string }>>(
      '/reports/vehicle-utilization',
      dateRange
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate report');
    }
    
    return response.data.data!.report;
  },

  generateMaintenanceReport: async (): Promise<GeneratedReport> => {
    const response = await api.post<ApiResponse<{ report: GeneratedReport; downloadUrl: string }>>(
      '/reports/maintenance'
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate report');
    }
    
    return response.data.data!.report;
  },

  generateTripSummaryReport: async (dateRange: ReportRequest): Promise<GeneratedReport> => {
    const response = await api.post<ApiResponse<{ report: GeneratedReport; downloadUrl: string }>>(
      '/reports/trip-summary',
      dateRange
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate report');
    }
    
    return response.data.data!.report;
  },

  getGeneratedReports: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<ApiResponse<any>>(`/reports?page=${page}&limit=${limit}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch reports');
    }
    
    return response.data.data!;
  },
  // Di report.service.ts, update downloadReport method:
downloadReport: async (filename: string): Promise<Blob> => {
  try {
    console.log('Downloading file:', filename);
    
    const response = await api.get(`/reports/download/${filename}`, {
      responseType: 'blob',
    });
    
    console.log('Download response status:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('Download error details:', error.response?.data || error.message);
    throw new Error(`Download failed: ${error.response?.data?.error || error.message}`);
  }
},
};