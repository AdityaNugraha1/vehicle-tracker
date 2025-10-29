import { describe, it, expect } from '@jest/globals';
import { 
  loginSchema, 
  registerSchema, 
  refreshTokenSchema,
  updateProfileSchema,
  updateUserRoleSchema
} from '../../utils/validation';
import { UserRole } from '@prisma/client';

describe('Validation Schemas - Unit Tests', () => {
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

    it('should reject invalid email format', () => {
      const testCases = [
        { email: 'invalid-email', password: 'password123' },
        { email: 'test@', password: 'password123' },
        { email: '@example.com', password: 'password123' },
        { email: 'test', password: 'password123' }
      ];

      testCases.forEach(data => {
        expect(() => loginSchema.parse(data)).toThrow();
      });
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing required fields', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com' })).toThrow();
      expect(() => loginSchema.parse({ password: 'password123' })).toThrow();
      expect(() => loginSchema.parse({})).toThrow();
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
      expect(result.role).toBe(UserRole.USER);
    });

    it('should accept valid custom roles', () => {
      const roles = [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN];
      
      roles.forEach(role => {
        const data = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role
        };

        const result = registerSchema.parse(data);
        expect(result.role).toBe(role);
      });
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'A'
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'INVALID_ROLE'
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Update Profile Schema', () => {
    it('should validate name update', () => {
      const validData = { name: 'Updated Name' };
      const result = updateProfileSchema.parse(validData);
      
      expect(result.name).toBe('Updated Name');
    });

    it('should validate password update', () => {
      const validData = { password: 'newpassword123' };
      const result = updateProfileSchema.parse(validData);
      
      expect(result.password).toBe('newpassword123');
    });

    it('should validate both name and password update', () => {
      const validData = { 
        name: 'Updated Name',
        password: 'newpassword123'
      };
      const result = updateProfileSchema.parse(validData);
      
      expect(result.name).toBe('Updated Name');
      expect(result.password).toBe('newpassword123');
    });

    it('should accept empty object (optional fields)', () => {
      const result = updateProfileSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe('Update User Role Schema', () => {
    it('should validate role update', () => {
      const validData = { role: UserRole.ADMIN };
      const result = updateUserRoleSchema.parse(validData);
      
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should reject invalid roles', () => {
      const invalidData = { role: 'INVALID' };
      expect(() => updateUserRoleSchema.parse(invalidData)).toThrow();
    });

    it('should require role field', () => {
      expect(() => updateUserRoleSchema.parse({})).toThrow();
    });
  });

  describe('Refresh Token Schema', () => {
    it('should validate refresh token', () => {
      const validData = { refreshToken: 'valid-token-string' };
      const result = refreshTokenSchema.parse(validData);
      
      expect(result.refreshToken).toBe('valid-token-string');
    });

    it('should require refreshToken field', () => {
      expect(() => refreshTokenSchema.parse({})).toThrow();
    });
  });
});
