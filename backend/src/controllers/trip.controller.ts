import { Request, Response } from 'express';
import { TripService } from '../services/trip.service';

export class TripController {
  static async startTrip(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { startLat, startLng } = req.body;

      console.log('Start trip request - params:', req.params);
      console.log('Start trip request - body:', req.body);

      if (!vehicleId) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle ID is required in URL parameters'
        });
      }

      if (typeof startLat !== 'number' || typeof startLng !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Valid startLat and startLng are required'
        });
      }

      const trip = await TripService.startTrip({
        vehicleId,
        startLat,
        startLng
      });

      res.status(201).json({
        success: true,
        message: 'Trip started successfully',
        data: { trip }
      });
    } catch (error) {
      console.error('Start trip error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to start trip'
        });
      }
    }
  }

  static async endTrip(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { endLat, endLng, distance, fuelUsed } = req.body;

      console.log('End trip request - params:', req.params);
      console.log('End trip request - body:', req.body);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Trip ID is required in URL parameters'
        });
      }

      if (typeof endLat !== 'number' || typeof endLng !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Valid endLat and endLng are required'
        });
      }

      if (typeof distance !== 'number' || distance < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid distance is required'
        });
      }

      if (typeof fuelUsed !== 'number' || fuelUsed < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid fuelUsed is required'
        });
      }

      const trip = await TripService.endTrip(id, {
        endLat,
        endLng,
        distance,
        fuelUsed
      });

      res.json({
        success: true,
        message: 'Trip ended successfully',
        data: { trip }
      });
    } catch (error) {
      console.error('End trip error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to end trip'
        });
      }
    }
  }

  static async getTrips(req: Request, res: Response) {
    try {
      const {
        vehicleId,
        startDate,
        endDate,
        status,
        page = 1,
        limit = 10
      } = req.query;

      const filters = {
        vehicleId: vehicleId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as any,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await TripService.getTrips(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trips'
      });
    }
  }

  static async getTripStats(req: Request, res: Response) {
    try {
      const { vehicleId, startDate, endDate } = req.query;

      const stats = await TripService.getTripStats(
        vehicleId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trip statistics'
      });
    }
  }
}