// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema, refreshTokenSchema } from '../utils/validation';
import { UserRole } from '../types';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Convert to proper types for service
      const registerData = {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        role: validatedData.role as UserRole
      };

      // Create user
      const result = await AuthService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  // User login
  static async login(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Authenticate user
      const result = await AuthService.login(validatedData);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  // Refresh tokens
  static async refreshTokens(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = refreshTokenSchema.parse(req.body);

      // Refresh tokens
      const result = await AuthService.refreshTokens(validatedData.refreshToken);

      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response) {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Get user details
      const user = await AuthService.getUserProfile(req.user.userId);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  // Logout (client-side token removal)
  static async logout(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Logout successful - please remove tokens from client storage'
    });
  }
}