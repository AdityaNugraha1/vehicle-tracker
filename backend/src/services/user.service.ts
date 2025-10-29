// src/services/user.service.ts
import { PrismaClient, User, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Tipe untuk user tanpa password
export type SafeUser = Omit<User, 'password'>;

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async createUser(
    email: string,
    passwordHash: string,
    name: string,
    role: UserRole
  ) {
    return prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role,
      },
    });
  }

  static async updateUser(
    userId: string,
    data: { name?: string; password?: string; role?: UserRole }
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role }),
      },
    });
    return user;
  }

  static async getAllUsers(): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return users;
  }

  // --- FUNGSI BARU DITAMBAHKAN ---
  /**
   * [ADMIN] Menghapus user berdasarkan ID
   */
  static async deleteUser(userId: string): Promise<User> {
    // Cari dulu untuk memastikan user ada sebelum mencoba menghapus
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    // Hapus user
    return prisma.user.delete({
      where: { id: userId },
    });
  }
  // --- AKHIR BLOK TAMBAHAN ---
}