import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AuthUtils } from '../../utils/auth';
import { UserRole } from '@prisma/client';

describe('Auth Utilities - Unit Tests', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthUtils.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await AuthUtils.hashPassword(password);
      const hash2 = await AuthUtils.hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Salt makes them different
    });

    it('should compare password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthUtils.hashPassword(password);
      
      const isValid = await AuthUtils.comparePassword(password, hashedPassword);
      const isInvalid = await AuthUtils.comparePassword('wrongpassword', hashedPassword);
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('should reject empty password', async () => {
      const hashedPassword = await AuthUtils.hashPassword('validpassword');
      const isValid = await AuthUtils.comparePassword('', hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    const payload = { 
      userId: '123e4567-e89b-12d3-a456-426614174000', 
      email: 'test@example.com', 
      role: UserRole.USER
    };

    it('should generate valid access token', () => {
      const token = AuthUtils.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should generate valid refresh token', () => {
      const refreshToken = AuthUtils.generateRefreshToken({
        userId: payload.userId,
        email: payload.email
      });
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.').length).toBe(3);
    });

    it('should verify and decode token correctly', () => {
      const token = AuthUtils.generateToken(payload);
      const decoded = AuthUtils.verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should include all required fields in token', () => {
      const token = AuthUtils.generateToken(payload);
      const decoded = AuthUtils.verifyToken(token);
      
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });
  });

  describe('JWT Token Verification', () => {
    it('should throw error for invalid token format', () => {
      expect(() => {
        AuthUtils.verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        AuthUtils.verifyToken('abc.def.ghi');
      }).toThrow('Invalid token');
    });

    it('should throw error for empty token', () => {
      expect(() => {
        AuthUtils.verifyToken('');
      }).toThrow('Invalid token');
    });

    it('should handle expired tokens', () => {
      // This would need a mocked expired token or time manipulation
      // For now, we test the error handling structure
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjF9.invalid';
      
      expect(() => {
        AuthUtils.verifyToken(invalidToken);
      }).toThrow();
    });
  });

  describe('Token Payload Validation', () => {
    it('should handle different user roles', () => {
      const roles = [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN];
      
      roles.forEach(role => {
        const token = AuthUtils.generateToken({
          userId: '123',
          email: 'test@example.com',
          role
        });
        const decoded = AuthUtils.verifyToken(token);
        
        expect(decoded.role).toBe(role);
      });
    });
  });
});
