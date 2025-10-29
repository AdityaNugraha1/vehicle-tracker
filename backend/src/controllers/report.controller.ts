// src/controllers/report.controller.ts
import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import fs from 'fs';
import path from 'path';
import { AuthUtils } from '../utils/auth';

export class ReportController {
  // Generate vehicle utilization report
  static async generateVehicleUtilizationReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
      }

      const dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };

      const result = await ReportService.generateVehicleUtilizationReport(
        dateRange, 
        req.user.userId
      );

      res.json({
        success: true,
        message: 'Vehicle utilization report generated successfully',
        data: {
          report: result.report,
          downloadUrl: `/api/reports/download/${path.basename(result.filepath)}`
        }
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate vehicle utilization report'
      });
    }
  }

  // Generate maintenance report
  static async generateMaintenanceReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const result = await ReportService.generateMaintenanceReport(req.user.userId);

      res.json({
        success: true,
        message: 'Maintenance report generated successfully',
        data: {
          report: result.report,
          downloadUrl: `/api/reports/download/${path.basename(result.filepath)}`
        }
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate maintenance report'
      });
    }
  }

  // Generate trip summary report
  static async generateTripSummaryReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
      }

      const dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };

      const result = await ReportService.generateTripSummaryReport(
        dateRange, 
        req.user.userId
      );

      res.json({
        success: true,
        message: 'Trip summary report generated successfully',
        data: {
          report: result.report,
          downloadUrl: `/api/reports/download/${path.basename(result.filepath)}`
        }
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate trip summary report'
      });
    }
  }

  // Download generated report
  // Di downloadReport method, perbaiki file path
  static async downloadReport(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      
      // Verify authentication
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Access token required' });
      }

      try {
        AuthUtils.verifyToken(token);
      } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // Security check
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }

      // FIX PATH: Gunakan path yang benar ke reports folder
      const filepath = path.join(process.cwd(), 'reports', filename);
      console.log('Looking for file at:', filepath);

      // Check if file exists
      if (!fs.existsSync(filepath)) {
        console.log('File not found at:', filepath);
        return res.status(404).json({ error: 'Report file not found' });
      }

      console.log('File found, serving download...');
      
      // Set headers untuk download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Stream file ke response
      const fileStream = fs.createReadStream(filepath);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        res.status(500).json({ error: 'Failed to stream file' });
      });
      
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  }

  // Get all generated reports for user
  static async getGeneratedReports(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ReportService.getGeneratedReports(req.user.userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch generated reports'
      });
    }
  }

  // Delete generated report
  static async deleteReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { id } = req.params;

      // First, get the report to check ownership and file path
      const report = await ReportService.getGeneratedReports(req.user.userId, 1, 100);
      const targetReport = report.reports.find(r => r.id === id);

      if (!targetReport) {
        return res.status(404).json({
          success: false,
          error: 'Report not found or access denied'
        });
      }

      // Delete file from filesystem if exists
      if (targetReport.filePath && fs.existsSync(targetReport.filePath)) {
        fs.unlinkSync(targetReport.filePath);
      }

      // Delete record from database (you'll need to add this method to ReportService)
      // await ReportService.deleteReport(id);

      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete report'
      });
    }
  }
}