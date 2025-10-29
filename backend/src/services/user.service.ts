import { PrismaClient, UserRole } from '@prisma/client';
import { AuthUtils } from '../utils/auth';

const prisma = new PrismaClient();

export class UserService {
  static async createUser(email: string, password: string, name: string, role: UserRole = UserRole.USER) {
    const hashedPassword = await AuthUtils.hashPassword(password);

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async updateUser(id: string, data: { name?: string; role?: UserRole }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
}