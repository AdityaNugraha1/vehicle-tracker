// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// User can manage their own profile
router.get('/me', UserController.getCurrentUser);
router.put('/me', UserController.updateCurrentUser);

// Admin only routes for user management
router.get('/', requireAdmin, UserController.getAllUsers);
router.get('/:id', requireAdmin, UserController.getUserById);
router.put('/:id', requireAdmin, UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;