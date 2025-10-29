// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  // Get current user
  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const user = await UserService.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update current user
  static async updateCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { name } = req.body;
      const user = await UserService.updateUser(req.user.userId, { name });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get all users (admin only)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get user by ID (admin only)
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update user (admin only)
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      const user = await UserService.updateUser(id, { name, role });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Delete user (admin only)
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user?.userId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }

      const user = await UserService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}