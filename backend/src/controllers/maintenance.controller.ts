// src/controllers/maintenance.controller.ts - BACKEND (DIPERBAIKI)
import { Request, Response } from 'express';
import { MaintenanceService } from '../services/maintenance.service';
import { MaintenanceType, MaintenanceStatus } from '@prisma/client';

export class MaintenanceController {
  // Get all maintenance records
  static async getMaintenance(req: Request, res: Response) {
    try {
      const {
        vehicleId,
        status,
        type,
        page = 1,
        limit = 10
      } = req.query;

      const filters = {
        vehicleId: vehicleId as string,
        status: status as MaintenanceStatus,
        type: type as MaintenanceType,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await MaintenanceService.getMaintenance(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get maintenance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch maintenance records'
      });
    }
  }

  // Create new maintenance record
  static async createMaintenance(req: Request, res: Response) {
    try {
      const { vehicleId, type, description, cost, date } = req.body;

      console.log('Create maintenance request:', req.body);

      // Validasi required fields
      if (!vehicleId || !type || !description) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle ID, type, and description are required'
        });
      }

      // Validasi maintenance type
      const validTypes = Object.values(MaintenanceType);
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid maintenance type. Valid types: ${validTypes.join(', ')}`
        });
      }

      const maintenance = await MaintenanceService.createMaintenance({
        vehicleId,
        type: type as MaintenanceType,
        description,
        cost: cost ? parseFloat(cost) : undefined,
        date: date ? new Date(date) : undefined
      });

      res.status(201).json({
        success: true,
        message: 'Maintenance scheduled successfully',
        data: { maintenance }
      });
    } catch (error) {
      console.error('Create maintenance error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to schedule maintenance'
        });
      }
    }
  }

  // Complete maintenance
  static async completeMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Maintenance ID is required'
        });
      }

      const maintenance = await MaintenanceService.completeMaintenance(id);

      res.json({
        success: true,
        message: 'Maintenance completed successfully',
        data: { maintenance }
      });
    } catch (error) {
      console.error('Complete maintenance error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to complete maintenance'
        });
      }
    }
  }

  // Start maintenance (set to in progress)
  static async startMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Maintenance ID is required'
        });
      }

      const maintenance = await MaintenanceService.startMaintenance(id);

      res.json({
        success: true,
        message: 'Maintenance started successfully',
        data: { maintenance }
      });
    } catch (error) {
      console.error('Start maintenance error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to start maintenance'
        });
      }
    }
  }

  // Get maintenance statistics
  static async getMaintenanceStats(req: Request, res: Response) {
    try {
      const stats = await MaintenanceService.getMaintenanceStats();

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get maintenance stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch maintenance statistics'
      });
    }
  }
}