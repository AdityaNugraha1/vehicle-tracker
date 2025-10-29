// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Terapkan middleware untuk SEMUA rute di file ini
router.use(authenticateToken);
router.use(requireAdmin);

// Rute-rute khusus Admin yang sudah ada
router.get('/', UserController.getAllUsers); // GET /api/users
router.post('/', UserController.createUser); // POST /api/users
router.patch('/:id/role', UserController.updateUserRole); // PATCH /api/users/:id/role
router.put('/:id', UserController.updateUser); // PUT /api/users/:id

// --- RUTE BARU DITAMBAHKAN ---
router.delete('/:id', UserController.deleteUser); // DELETE /api/users/:id
// --- AKHIR BLOK TAMBAHAN ---

export default router;