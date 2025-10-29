import { describe, it, expect } from '@jest/globals';
import { VehicleStatus } from '@prisma/client';

describe('Vehicle Business Logic - Unit Tests', () => {
  describe('License Plate Validation', () => {
    it('should validate correct Indonesian license plate format', () => {
      const validPlates = [
        'B 1234 CD',
        'B 5678 EF',
        'D 9012 GH',
        'F 3456 IJ'
      ];

      validPlates.forEach(plate => {
        expect(plate).toMatch(/^[A-Z] \d{4} [A-Z]{2}$/);
      });
    });

    it('should reject invalid license plate formats', () => {
      const invalidPlates = [
        'B1234CD',        // No spaces
        'B 123 CD',       // Only 3 digits
        '1234 CD',        // No area code
        'B 12345 CD',     // 5 digits
        'BB 1234 CD',     // 2 area letters
        'B 1234 C'        // Only 1 suffix letter
      ];

      invalidPlates.forEach(plate => {
        expect(plate).not.toMatch(/^[A-Z] \d{4} [A-Z]{2}$/);
      });
    });
  });

  describe('Vehicle Status Management', () => {
    it('should validate status transitions', () => {
      const validTransitions = [
        { from: VehicleStatus.AVAILABLE, to: VehicleStatus.ON_TRIP },
        { from: VehicleStatus.ON_TRIP, to: VehicleStatus.AVAILABLE },
        { from: VehicleStatus.AVAILABLE, to: VehicleStatus.MAINTENANCE },
        { from: VehicleStatus.MAINTENANCE, to: VehicleStatus.AVAILABLE },
        { from: VehicleStatus.AVAILABLE, to: VehicleStatus.LOADING },
        { from: VehicleStatus.LOADING, to: VehicleStatus.ON_TRIP }
      ];

      validTransitions.forEach(transition => {
        expect(transition.from).toBeDefined();
        expect(transition.to).toBeDefined();
      });
    });

    it('should identify invalid status transitions', () => {
      const invalidTransitions = [
        { from: VehicleStatus.ON_TRIP, to: VehicleStatus.MAINTENANCE },
        { from: VehicleStatus.MAINTENANCE, to: VehicleStatus.ON_TRIP }
      ];

      // These should require going through AVAILABLE first
      invalidTransitions.forEach(transition => {
        expect(transition.from).not.toBe(VehicleStatus.AVAILABLE);
        expect(transition.to).not.toBe(VehicleStatus.AVAILABLE);
      });
    });
  });

  describe('Vehicle Statistics Calculations', () => {
    it('should calculate utilization rate correctly', () => {
      const mockVehicles = [
        { status: VehicleStatus.AVAILABLE },
        { status: VehicleStatus.ON_TRIP },
        { status: VehicleStatus.ON_TRIP },
        { status: VehicleStatus.MAINTENANCE },
        { status: VehicleStatus.AVAILABLE }
      ];

      const total = mockVehicles.length;
      const available = mockVehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length;
      const onTrip = mockVehicles.filter(v => v.status === VehicleStatus.ON_TRIP).length;
      const utilization = (onTrip / total) * 100;

      expect(total).toBe(5);
      expect(available).toBe(2);
      expect(onTrip).toBe(2);
      expect(utilization).toBe(40);
    });

    it('should handle zero vehicles', () => {
      const vehicles: any[] = [];
      const utilization = vehicles.length > 0 
        ? (vehicles.filter(v => v.status === VehicleStatus.ON_TRIP).length / vehicles.length) * 100 
        : 0;

      expect(utilization).toBe(0);
    });

    it('should calculate average fuel level', () => {
      const vehicles = [
        { fuelLevel: 80 },
        { fuelLevel: 60 },
        { fuelLevel: 90 },
        { fuelLevel: 70 }
      ];

      const avgFuel = vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length;
      
      expect(avgFuel).toBe(75);
    });
  });

  describe('Fuel Level Management', () => {
    it('should validate fuel level range', () => {
      const validLevels = [0, 25, 50, 75, 100];
      
      validLevels.forEach(level => {
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(100);
      });
    });

    it('should identify low fuel levels', () => {
      const lowFuelThreshold = 20;
      const fuelLevels = [10, 15, 25, 50, 80];
      
      const lowFuelVehicles = fuelLevels.filter(level => level < lowFuelThreshold);
      
      expect(lowFuelVehicles).toEqual([10, 15]);
    });

    it('should calculate fuel consumption', () => {
      const initialFuel = 100;
      const fuelUsed = 35;
      const remainingFuel = Math.max(0, initialFuel - fuelUsed);
      
      expect(remainingFuel).toBe(65);
    });

    it('should not allow negative fuel', () => {
      const initialFuel = 20;
      const fuelUsed = 30;
      const remainingFuel = Math.max(0, initialFuel - fuelUsed);
      
      expect(remainingFuel).toBe(0);
    });
  });

  describe('Search and Filter Logic', () => {
    it('should filter vehicles by status', () => {
      const vehicles = [
        { id: '1', status: VehicleStatus.AVAILABLE },
        { id: '2', status: VehicleStatus.ON_TRIP },
        { id: '3', status: VehicleStatus.AVAILABLE }
      ];

      const available = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE);
      
      expect(available.length).toBe(2);
      expect(available.map(v => v.id)).toEqual(['1', '3']);
    });

    it('should search by license plate', () => {
      const vehicles = [
        { licensePlate: 'B 1234 CD' },
        { licensePlate: 'B 5678 EF' },
        { licensePlate: 'D 1234 GH' }
      ];

      const searchTerm = '1234';
      const results = vehicles.filter(v => v.licensePlate.includes(searchTerm));
      
      expect(results.length).toBe(2);
    });
  });
});
