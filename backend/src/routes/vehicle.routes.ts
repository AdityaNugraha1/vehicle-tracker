// src/routes/vehicle.routes.ts
import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { TripController } from '../controllers/trip.controller';
import { authenticateToken, requireAdmin, requireManager, requireAdminOrManager } from '../middlewares/auth.middleware';

const router = Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// Public vehicle routes (any authenticated user)
router.get('/', VehicleController.getVehicles);
router.get('/search', VehicleController.searchVehicles);
router.get('/stats', VehicleController.getVehicleStats);

// FIX: Tambahkan route untuk /available
router.get('/available', VehicleController.getAvailableVehicles);

router.get('/:id', VehicleController.getVehicle);

// Protected vehicle routes (Admin/Manager only)
router.post('/', requireAdminOrManager, VehicleController.createVehicle);
router.put('/:id', requireAdminOrManager, VehicleController.updateVehicle);
router.delete('/:id', requireAdmin, VehicleController.deleteVehicle);
router.patch('/:id/location', requireAdminOrManager, VehicleController.updateVehicleLocation);

// Trip routes with proper authorization
router.post('/:vehicleId/trips/start', requireAdminOrManager, TripController.startTrip);
router.patch('/trips/:id/end', requireAdminOrManager, TripController.endTrip);
router.get('/:vehicleId/trips', TripController.getTrips); // Fixed: Use TripController
router.get('/:vehicleId/trips/stats', TripController.getTripStats); // Fixed: Use TripController

// General trip routes (not vehicle-specific)
router.get('/trips/all', TripController.getTrips); // Fixed: Use TripController
router.get('/trips/stats', TripController.getTripStats); // Fixed: Use TripController

export default router;