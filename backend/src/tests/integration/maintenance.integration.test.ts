import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app'; 
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

let adminToken: string;
let adminUserId: string;
let testVehicleId: string;
let createdMaintenanceId: string;
const testLicensePlate = `MAINT-${Date.now() % 10000}`;

beforeAll(async () => {
  const adminRes = await request(app).post('/api/auth/register').send({
    email: `maint-admin-${Date.now()}@test.com`,
    password: 'Password123',
    name: 'Maint Admin',
    role: UserRole.ADMIN,
  });
  adminToken = adminRes.body.data.tokens.accessToken;
  adminUserId = adminRes.body.data.user.id;

  const vehicle = await prisma.vehicle.create({
    data: {
      licensePlate: testLicensePlate,
      brand: 'Isuzu',
      model: 'Panther',
      year: 2005,
      color: 'Blue',
      userId: adminUserId,
      status: 'AVAILABLE',
    },
  });
  testVehicleId = vehicle.id;
});

afterAll(async () => {
  if (createdMaintenanceId)
    await prisma.maintenance
      .delete({ where: { id: createdMaintenanceId } })
      .catch(() => {});
  if (testVehicleId)
    await prisma.vehicle
      .delete({ where: { id: testVehicleId } })
      .catch(() => {});
  if (adminUserId)
    await prisma.user.delete({ where: { id: adminUserId } }).catch(() => {});
  await prisma.$disconnect();
});

describe('Maintenance API Integration Tests', () => {

  describe('POST /api/maintenance', () => {
    it('should create maintenance (ENGINE_REPAIR) and set vehicle status (201)', async () => {
      const res = await request(app)
        .post('/api/maintenance') 
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vehicleId: testVehicleId,
          type: 'ENGINE_REPAIR', 
          description: 'Mesin rusak',
          cost: 5000000,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.maintenance.status).toBe('SCHEDULED');
      createdMaintenanceId = res.body.data.maintenance.id;

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: testVehicleId },
      });
      expect(vehicle?.status).toBe('MAINTENANCE'); 
    });
  });

  describe('PATCH /api/maintenance/:id/start & /complete', () => {
    it('should start maintenance (200)', async () => {
      const res = await request(app)
        .patch(`/api/maintenance/${createdMaintenanceId}/start`) 
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.maintenance.status).toBe('IN_PROGRESS'); 
    });

    it('should complete maintenance and restore vehicle status (200)', async () => {
      const res = await request(app)
        .patch(`/api/maintenance/${createdMaintenanceId}/complete`) 
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.maintenance.status).toBe('COMPLETED'); 

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: testVehicleId },
      });
      expect(vehicle?.status).toBe('AVAILABLE'); 
    });
  });
});