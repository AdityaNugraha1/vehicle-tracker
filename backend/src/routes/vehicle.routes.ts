import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { TripController } from '../controllers/trip.controller';
import { authenticateToken, requireAdmin, requireManager, requireAdminOrManager } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', VehicleController.getVehicles);
router.get('/search', VehicleController.searchVehicles);
router.get('/stats', VehicleController.getVehicleStats);

router.get('/available', VehicleController.getAvailableVehicles);

router.get('/:id', VehicleController.getVehicle);

router.post('/', requireAdminOrManager, VehicleController.createVehicle);
router.put('/:id', requireAdminOrManager, VehicleController.updateVehicle);
router.delete('/:id', requireAdmin, VehicleController.deleteVehicle);
router.patch('/:id/location', requireAdminOrManager, VehicleController.updateVehicleLocation);

router.post('/:vehicleId/trips/start', requireAdminOrManager, TripController.startTrip);
router.patch('/trips/:id/end', requireAdminOrManager, TripController.endTrip);
router.get('/:vehicleId/trips', TripController.getTrips); 
router.get('/:vehicleId/trips/stats', TripController.getTripStats); 

router.get('/trips/all', TripController.getTrips);
router.get('/trips/stats', TripController.getTripStats);

export default router;