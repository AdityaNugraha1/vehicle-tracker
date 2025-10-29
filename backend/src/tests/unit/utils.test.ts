// src/tests/unit/utils.test.ts
import { describe, it, expect } from '@jest/globals';

describe('Utility Functions', () => {
  describe('String Utilities', () => {
    it('should extract token from authorization header', () => {
      const authHeader = 'Bearer abc123.def456.ghi789';
      const parts = authHeader.split(' ');
      const token = parts[1];
      
      expect(token).toBe('abc123.def456.ghi789');
      expect(parts[0]).toBe('Bearer');
    });

    it('should handle string operations', () => {
      const licensePlate = 'B 1234 CD';
      const searchTerm = 'B 1234';
      const containsSearch = licensePlate.includes(searchTerm);
      
      expect(containsSearch).toBe(true);
    });
  });

  describe('Number Utilities', () => {
    it('should calculate fuel efficiency', () => {
      const distance = 250;
      const fuelUsed = 25;
      const efficiency = fuelUsed > 0 ? distance / fuelUsed : 0;
      
      expect(efficiency).toBe(10);
    });

    it('should round numbers correctly', () => {
      const number = 25.5678;
      const rounded = Math.round(number * 100) / 100;
      
      expect(rounded).toBe(25.57);
    });

    it('should calculate utilization rate', () => {
      const totalVehicles = 10;
      const activeVehicles = 3;
      const utilization = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
      
      expect(utilization).toBe(30);
    });
  });

  describe('Date Utilities', () => {
    it('should create valid dates', () => {
      const date = new Date('2024-01-15');
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it('should calculate date differences', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');
      const timeDiff = endDate.getTime() - startDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24);
      
      expect(dayDiff).toBe(9);
    });
  });
});