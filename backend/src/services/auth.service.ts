// src/services/auth.service.ts
import { UserRole } from "@prisma/client";
import { UserService } from "./user.service";
import { AuthUtils } from "../utils/auth";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export class AuthService {
  // User registration
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name, role = UserRole.USER } = data;

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create user
    const user = await UserService.createUser(email, password, name, role);

    // Generate tokens
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

    return {
      user,
      tokens,
    };
  }

  // User login
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await UserService.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await AuthUtils.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
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

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  // Refresh tokens
  static async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = AuthUtils.verifyRefreshToken(refreshToken) as {
        userId: string;
        email: string;
      };

      const user = await UserService.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate new tokens
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

      return {
        user,
        tokens,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
  static async getUserProfile(userId: string) {
    const user = await UserService.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}
