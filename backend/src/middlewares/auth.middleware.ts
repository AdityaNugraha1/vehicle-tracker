// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';
import { UserRole } from '@prisma/client';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = AuthUtils.verifyToken(token) as { userId: string; email: string; role: UserRole };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Specific role middlewares for convenience
export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireManager = requireRole([UserRole.ADMIN, UserRole.MANAGER]);
export const requireAdminOrManager = requireRole([UserRole.ADMIN, UserRole.MANAGER]);