// src/tests/integration/user.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app'; //
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

let adminToken: string;
let adminUserId: string;
let createdUserId: string;

const adminEmail = `user-admin-${Date.now()}@test.com`;
const testPassword = 'Password123';
const userToCreateEmail = `new-user-${Date.now()}@test.com`;

beforeAll(async () => {
  // Buat Admin User
  const adminRes = await request(app).post('/api/auth/register').send({
    email: adminEmail,
    password: testPassword,
    name: 'User Admin',
    role: UserRole.ADMIN, //
  });
  adminToken = adminRes.body.data.tokens.accessToken;
  adminUserId = adminRes.body.data.user.id;
});

afterAll(async () => {
  await prisma.user
    .deleteMany({ where: { id: { in: [adminUserId, createdUserId] } } })
    .catch(() => {});
  await prisma.$disconnect();
});

describe('User Management API Integration Tests (Admin Only)', () => {
  /**
   * Menguji Rute Admin [GET] /api/users
   */
  describe('GET /api/users', () => {
    it('should get all users for ADMIN (200)', async () => {
      const res = await request(app)
        .get('/api/users') //
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeInstanceOf(Array);
      // Minimal ada 1 user (admin itu sendiri)
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });
  });

  /**
   * Menguji Rute Admin [POST] /api/users
   */
  describe('POST /api/users', () => {
    it('should create a new user (by Admin) (201)', async () => {
      const res = await request(app)
        .post('/api/users') //
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: userToCreateEmail,
          password: testPassword,
          name: 'Created By Admin',
          role: UserRole.MANAGER,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User created successfully by admin'); //
      expect(res.body.data.user.email).toBe(userToCreateEmail);
      expect(res.body.data.user.role).toBe(UserRole.MANAGER);
      createdUserId = res.body.data.user.id;
    });
  });

  /**
   * Menguji Rute Admin [PATCH] /api/users/:id/role
   */
  describe('PATCH /api/users/:id/role', () => {
    it('should update user role (by Admin) (200)', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}/role`) //
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: UserRole.USER, //
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.role).toBe(UserRole.USER);
    });
  });

  /**
   * Menguji Rute Admin [DELETE] /api/users/:id
   */
  describe('DELETE /api/users/:id', () => {
    it('should delete user (by Admin) (200)', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`) //
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User deleted successfully'); //

      // Verifikasi
      const user = await prisma.user.findUnique({
        where: { id: createdUserId },
      });
      expect(user).toBeNull();
    });
  });
});