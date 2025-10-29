// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  updateProfileSchema, // Pastikan ini di-import
} from '../utils/validation';
import { UserRole } from '../types';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);

      const registerData = {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        role: validatedData.role as UserRole,
      };

      const result = await AuthService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  // User login
  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await AuthService.login(validatedData);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  // Refresh tokens
  static async refreshTokens(req: Request, res: Response) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);

      const result = await AuthService.refreshTokens(validatedData.refreshToken);

      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  // Logout
  static async logout(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Logout successful - please remove tokens from client storage',
    });
  }

  // --- HANDLER PROFIL ---

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      // User diisi oleh middleware 'authenticateToken'
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, error: 'User not authenticated' });
      }

      // Panggilan ini sekarang valid
      const user = await AuthService.getUserProfile(req.user.userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  /**
   * Update current user profile
   * PATCH /api/auth/profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, error: 'User not authenticated' });
      }

      // Validasi body
      const validatedData = updateProfileSchema.parse(req.body);

      // Panggilan ini sekarang valid
      const updatedUser = await AuthService.updateProfile(
        req.user.userId,
        validatedData
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }
}