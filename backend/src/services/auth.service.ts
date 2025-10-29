import { UserRole, User } from '@prisma/client';
import { UserService } from './user.service';
import { AuthUtils } from '../utils/auth';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name, role = UserRole.USER } = data;

    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const passwordHash = await AuthUtils.hashPassword(password);

    const user = await UserService.createUser(email, passwordHash, name, role);

    const tokens = {
      accessToken: AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      }),
      refreshToken: AuthUtils.generateRefreshToken({
        userId: user.id,
        email: user.email,
      }),
    };

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await UserService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await AuthUtils.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const tokens = {
      accessToken: AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      }),
      refreshToken: AuthUtils.generateRefreshToken({
        userId: user.id,
        email: user.email,
      }),
    };

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  static async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = AuthUtils.verifyRefreshToken(refreshToken) as {
        userId: string;
        email: string;
      };

      const user = await UserService.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const tokens = {
        accessToken: AuthUtils.generateToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        }),
        refreshToken: AuthUtils.generateRefreshToken({
          userId: user.id,
          email: user.email,
        }),
      };

      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async getUserProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await UserService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; password?: string }
  ): Promise<Omit<User, 'password'>> {
    const updateData: { name?: string; password?: string } = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.password) {
      updateData.password = await AuthUtils.hashPassword(data.password);
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No data provided for update');
    }

    const updatedUser = await UserService.updateUser(userId, updateData);

    const { password: _, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}