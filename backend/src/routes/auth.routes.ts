// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
// 1. Menggunakan nama yang benar dari file Anda
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rute-rute ini tidak memerlukan autentikasi
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-tokens', AuthController.refreshTokens);
router.post('/logout', AuthController.logout);

// 2. Rute profil sekarang menggunakan 'authenticateToken'
router.get('/profile', authenticateToken, AuthController.getProfile);
router.patch('/profile', authenticateToken, AuthController.updateProfile);

export default router;