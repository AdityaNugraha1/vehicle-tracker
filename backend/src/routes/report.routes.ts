// src/routes/report.routes.ts
import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken, requireAdminOrManager } from '../middlewares/auth.middleware';

const router = Router();

// All report routes require authentication
router.use(authenticateToken);

// Report generation routes (Admin/Manager only)
router.post('/vehicle-utilization', requireAdminOrManager, ReportController.generateVehicleUtilizationReport);
router.post('/maintenance', requireAdminOrManager, ReportController.generateMaintenanceReport);
router.post('/trip-summary', requireAdminOrManager, ReportController.generateTripSummaryReport);

// Report management routes (users can access their own reports)
router.get('/', ReportController.getGeneratedReports);
router.delete('/:id', ReportController.deleteReport);

// Public download route (no auth required for download links)
router.get('/download/:filename', ReportController.downloadReport);

export default router;