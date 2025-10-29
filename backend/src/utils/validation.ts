// src/utils/validation.ts
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Convert UserRole enum to array for Zod
const userRoleEnum = Object.values(UserRole) as [string, ...string[]];

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(userRoleEnum).optional().default(UserRole.USER),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
});

// --- TAMBAHKAN SKEMA INI ---
export const updateUserRoleSchema = z.object({
  role: z.enum(userRoleEnum),
});
// --- AKHIR BLOK TAMBAHAN ---

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;