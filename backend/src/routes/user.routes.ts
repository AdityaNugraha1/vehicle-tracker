import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', UserController.getAllUsers);
router.post('/', UserController.createUser); 
router.patch('/:id/role', UserController.updateUserRole); 
router.put('/:id', UserController.updateUser); 

router.delete('/:id', UserController.deleteUser);

export default router;