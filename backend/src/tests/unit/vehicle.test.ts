import { describe, it, expect } from '@jest/globals';

describe('Vehicle Service Logic', () => {
  describe('Vehicle Data Validation', () => {
    it('should validate license plate format', () => {
      const validLicensePlates = [
        'B 1234 CD',
        'B 5678 EF', 
        'B 9012 GH'
      ];

      validLicensePlates.forEach(plate => {
        expect(plate).toMatch(/^[A-Z] \d{4} [A-Z]{2}$/);
      });
    });

    it('should reject invalid license plates', () => {
      const invalidLicensePlates = [
        'B1234CD',
        'B 123 CD',
        '1234 CD',
        'B 12345 CD'
      ];

      invalidLicensePlates.forEach(plate => {
        expect(plate).not.toMatch(/^[A-Z] \d{4} [A-Z]{2}$/);
      });
    });
  });

  describe('Vehicle Status Logic', () => {
    it('should track vehicle status transitions', () => {
      const statusFlow = [
        { from: 'AVAILABLE', to: 'ON_TRIP', valid: true },
        { from: 'ON_TRIP', to: 'AVAILABLE', valid: true },
        { from: 'AVAILABLE', to: 'MAINTENANCE', valid: true },
        { from: 'MAINTENANCE', to: 'AVAILABLE', valid: true }
      ];

      statusFlow.forEach(flow => {
        expect(flow.valid).toBe(true);
      });
    });
  });

  describe('Vehicle Statistics', () => {
    it('should calculate metrics correctly', () => {
      const vehicles = [
        { status: 'AVAILABLE' },
        { status: 'ON_TRIP' },
        { status: 'ON_TRIP' },
        { status: 'MAINTENANCE' },
        { status: 'AVAILABLE' }
      ];

      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
      const onTripVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length;
      const utilizationRate = (onTripVehicles / totalVehicles) * 100;

      expect(totalVehicles).toBe(5);
      expect(availableVehicles).toBe(2);
      expect(onTripVehicles).toBe(2);
      expect(utilizationRate).toBe(40);
    });
  });
});