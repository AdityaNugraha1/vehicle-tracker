import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-tokens', AuthController.refreshTokens);
router.post('/logout', AuthController.logout);

router.get('/profile', authenticateToken, AuthController.getProfile);
router.patch('/profile', authenticateToken, AuthController.updateProfile);

export default router;