import { Request, Response } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { TripService } from '../services/trip.service';

export class VehicleController {
  static async getVehicles(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await VehicleService.getAllVehicles(page, limit, search);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles'
      });
    }
  }

  static async getVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vehicle = await VehicleService.getVehicleById(id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }

      res.json({
        success: true,
        data: { vehicle }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle'
      });
    }
  }

  static async createVehicle(req: Request, res: Response) {
    try {
      const { licensePlate, brand, model, year, color, fuelLevel, odometer } = req.body;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const vehicle = await VehicleService.createVehicle({
        licensePlate,
        brand,
        model,
        year: parseInt(year),
        color,
        userId: req.user.userId,
        fuelLevel: fuelLevel ? parseInt(fuelLevel) : undefined,
        odometer: odometer ? parseInt(odometer) : undefined
      });

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: { vehicle }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create vehicle'
        });
      }
    }
  }

  static async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.year) updates.year = parseInt(updates.year);
      if (updates.fuelLevel) updates.fuelLevel = parseInt(updates.fuelLevel);
      if (updates.odometer) updates.odometer = parseInt(updates.odometer);

      const vehicle = await VehicleService.updateVehicle(id, updates);

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: { vehicle }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update vehicle'
        });
      }
    }
  }

  static async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vehicle = await VehicleService.deleteVehicle(id);

      res.json({
        success: true,
        message: 'Vehicle deleted successfully',
        data: { vehicle }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete vehicle'
        });
      }
    }
  }

  static async getVehicleStats(req: Request, res: Response) {
    try {
      const stats = await VehicleService.getVehicleStats();

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle statistics'
      });
    }
  }

  static async updateVehicleLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude must be numbers'
        });
      }

      const vehicle = await VehicleService.updateVehicleLocation(id, latitude, longitude);

      res.json({
        success: true,
        message: 'Vehicle location updated successfully',
        data: { vehicle }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update vehicle location'
      });
    }
  }

  static async searchVehicles(req: Request, res: Response) {
    try {
      const {
        status,
        brand,
        model,
        year,
        page = 1,
        limit = 10
      } = req.query;

      const result = await VehicleService.searchVehicles({
        status: status as any,
        brand: brand as string,
        model: model as string,
        year: year ? parseInt(year as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to search vehicles'
      });
    }
  }
  static async getAvailableVehicles(req: Request, res: Response) {
    try {
      const vehicles = await VehicleService.getAvailableVehicles();

      res.json({
        success: true,
        data: vehicles 
      });

    } catch (error) {
      console.error('Get available vehicles error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch available vehicles'
        });
      }
    }
  }
}