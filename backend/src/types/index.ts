// src/types/index.ts
import { UserRole as PrismaUserRole } from '@prisma/client';

// Re-export Prisma enum to avoid conflicts
export type UserRole = PrismaUserRole;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  tokens: AuthTokens;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}