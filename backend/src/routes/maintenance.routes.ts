// src/routes/maintenance.routes.ts - BACKEND
import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { authenticateToken, requireAdminOrManager } from '../middlewares/auth.middleware';

const router = Router();

// All maintenance routes require authentication
router.use(authenticateToken);

// Maintenance routes
router.get('/', MaintenanceController.getMaintenance);
router.get('/stats', MaintenanceController.getMaintenanceStats);
router.post('/', requireAdminOrManager, MaintenanceController.createMaintenance);
router.patch('/:id/complete', requireAdminOrManager, MaintenanceController.completeMaintenance);
router.patch('/:id/start', requireAdminOrManager, MaintenanceController.startMaintenance);

export default router;