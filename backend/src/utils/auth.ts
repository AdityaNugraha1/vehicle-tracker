import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { UserRole } from '../types';

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: { userId: string; email: string; role: UserRole }): string {
    return jwt.sign(
      payload, 
      config.jwtSecret, 
      { 
        expiresIn: config.jwtExpiresIn 
      } as jwt.SignOptions
    );
  }

  static generateRefreshToken(payload: { userId: string; email: string }): string {
    return jwt.sign(
      payload, 
      config.jwtRefreshSecret, 
      { 
        expiresIn: config.jwtRefreshExpiresIn 
      } as jwt.SignOptions
    );
  }

    static verifyToken(token: string): { userId: string; email: string; role: UserRole } {
    try {
        return jwt.verify(token, config.jwtSecret) as { userId: string; email: string; role: UserRole };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
        } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
        }
        throw new Error('Invalid token');
    }
    }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtRefreshSecret);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}