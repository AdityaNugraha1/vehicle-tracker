// src/tests/unit/auth.test.ts
import { describe, it, expect, jest } from '@jest/globals';
import { AuthUtils } from '../../utils/auth';
import { UserRole } from '@prisma/client';

// Mock config untuk tests
jest.mock('../../config', () => ({
  config: {
    jwtSecret: 'test-secret',
    jwtRefreshSecret: 'test-refresh-secret',
    jwtExpiresIn: '1h',
    jwtRefreshExpiresIn: '7d'
  }
}));

describe('Auth Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthUtils.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should compare password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthUtils.hashPassword(password);
      
      const isValid = await AuthUtils.comparePassword(password, hashedPassword);
      const isInvalid = await AuthUtils.comparePassword('wrongpassword', hashedPassword);
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Tokens', () => {
    const payload = { 
      userId: '123', 
      email: 'test@test.com', 
      role: UserRole.USER
    };

    it('should generate and verify token', () => {
      const token = AuthUtils.generateToken(payload);
      const decoded = AuthUtils.verifyToken(token);
      
      expect(token).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        AuthUtils.verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });
  });
});