// src/tests/unit/validation.test.ts
import { loginSchema, registerSchema } from '../../utils/validation';
import { describe, it, expect } from '@jest/globals';

describe('Validation Schemas', () => {
  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.parse(validData);
      
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Register Schema', () => {
    it('should validate correct register data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = registerSchema.parse(validData);
      
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
      expect(result.name).toBe('Test User');
      expect(result.role).toBe('USER');
    });

    it('should accept custom role', () => {
      const validData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'ADMIN'
      };

      const result = registerSchema.parse(validData);
      
      expect(result.role).toBe('ADMIN');
    });
  });
});