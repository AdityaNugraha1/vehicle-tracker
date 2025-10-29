// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserRole } from '@prisma/client';
import {
  updateUserRoleSchema,
  registerSchema,
} from '../utils/validation';
import { AuthService } from '../services/auth.service';

export class UserController {
  // ... (updateUser, getAllUsers, updateUserRole, createUser tidak berubah) ...
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      if (role && !Object.values(UserRole).includes(role)) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid role' });
      }

      const user = await UserService.updateUser(id, {
        name: name || undefined,
        role: role || undefined,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = user;
      res.json({ success: true, data: { user: safeUser } });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.json({
        success: true,
        data: { users },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
  static async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params; 

      const validatedData = updateUserRoleSchema.parse(req.body);

      const updatedUser = await UserService.updateUser(id, {
        role: validatedData.role as UserRole,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = updatedUser;

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: { user: safeUser },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Validation failed',
      });
    }
  }
  static async createUser(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);

      const result = await AuthService.register({
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        role: validatedData.role as UserRole,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully by admin',
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

  // --- HANDLER BARU DITAMBAHKAN ---
  /**
   * [ADMIN] Handler untuk menghapus user
   * (Rute: DELETE /api/users/:id)
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 1. (Opsional tapi direkomendasikan) Jangan biarkan admin menghapus dirinya sendiri
      if (req.user?.userId === id) {
        return res
          .status(400)
          .json({ success: false, error: 'Cannot delete yourself' });
      }

      // 2. Panggil service untuk menghapus
      await UserService.deleteUser(id);

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      // Tangkap error jika user tidak ditemukan atau error lainnya
      res.status(error instanceof Error && error.message === 'User not found' ? 404 : 500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
  // --- AKHIR BLOK TAMBAHAN ---
}