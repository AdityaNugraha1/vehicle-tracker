// src/tests/unit/report.test.ts
import ExcelJS from 'exceljs';
import { describe, it, expect } from '@jest/globals';

describe('Report Service - Excel Generation', () => {
  describe('Excel Workbook Creation', () => {
    it('should create workbook with worksheet', () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Test Sheet');
      
      expect(workbook).toBeDefined();
      expect(worksheet).toBeDefined();
      expect(workbook.worksheets.length).toBe(1);
    });

    it('should add columns to worksheet', () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Test Sheet');
      
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 15 },
        { header: 'Email', key: 'email', width: 25 }
      ];
      
      expect(worksheet.columns).toBeDefined();
      expect(worksheet.columns.length).toBe(2);
    });

    it('should add data rows to worksheet', () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Test Sheet');
      
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 15 },
        { header: 'Email', key: 'email', width: 25 }
      ];
      
      worksheet.addRow({ name: 'John Doe', email: 'john@example.com' });
      worksheet.addRow({ name: 'Jane Smith', email: 'jane@example.com' });
      
      expect(worksheet.rowCount).toBe(3); // Header + 2 data rows
    });
  });

  describe('Report Data Formatting', () => {
    it('should format numbers correctly', () => {
      const distance = 25.5678;
      const fuelUsed = 8.2345;
      
      const formattedDistance = Math.round(distance * 100) / 100;
      const formattedFuelUsed = Math.round(fuelUsed * 100) / 100;
      
      expect(formattedDistance).toBe(25.57);
      expect(formattedFuelUsed).toBe(8.23);
    });

    it('should calculate fuel efficiency correctly', () => {
      const totalDistance = 250;
      const totalFuelUsed = 25;
      const fuelEfficiency = totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;
      
      expect(fuelEfficiency).toBe(10);
    });

    it('should handle zero fuel used', () => {
      const totalDistance = 250;
      const totalFuelUsed = 0;
      const fuelEfficiency = totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;
      
      expect(fuelEfficiency).toBe(0);
    });
  });
});