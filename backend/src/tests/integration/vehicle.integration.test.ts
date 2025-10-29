import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app'; //
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

let adminToken: string;
let userToken: string;
let adminUserId: string;
let regularUserId: string;
let createdVehicleId: string;
let createdTripId: string;

const adminEmail = `vehicle-admin-${Date.now()}@test.com`;
const userEmail = `vehicle-user-${Date.now()}@test.com`;
const testPassword = 'Password123';
const testLicensePlate = `INT-${Date.now() % 10000}`;

beforeAll(async () => {
  const adminRes = await request(app).post('/api/auth/register').send({
    email: adminEmail,
    password: testPassword,
    name: 'Vehicle Admin',
    role: UserRole.ADMIN, 
  });
  adminToken = adminRes.body.data.tokens.accessToken;
  adminUserId = adminRes.body.data.user.id;

  const userRes = await request(app).post('/api/auth/register').send({
    email: userEmail,
    password: testPassword,
    name: 'Vehicle User',
    role: UserRole.USER, 
  });
  userToken = userRes.body.data.tokens.accessToken;
  regularUserId = userRes.body.data.user.id;
});

afterAll(async () => {
  if (createdTripId)
    await prisma.trip.delete({ where: { id: createdTripId } }).catch(() => {});
  if (createdVehicleId)
    await prisma.vehicle
      .delete({ where: { id: createdVehicleId } })
      .catch(() => {});
  await prisma.user
    .deleteMany({ where: { id: { in: [adminUserId, regularUserId] } } })
    .catch(() => {});
  await prisma.$disconnect();
});

describe('Vehicle & Trip API Integration Tests', () => {
  describe('POST /api/vehicles', () => {
    it('should fail to create vehicle for regular USER (403)', async () => {
      const res = await request(app)
        .post('/api/vehicles') 
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          licensePlate: `${testLicensePlate}-U`,
          brand: 'Honda',
          model: 'Jazz',
          year: 2020,
          color: 'Red',
        });
      expect(res.statusCode).toBe(403); 
    });

    it('should create a new vehicle for ADMIN (201)', async () => {
      const res = await request(app)
        .post('/api/vehicles') 
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          licensePlate: testLicensePlate,
          brand: 'Toyota',
          model: 'Avanza',
          year: 2022,
          color: 'Silver',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicle.licensePlate).toBe(testLicensePlate);
      expect(res.body.data.vehicle.status).toBe('AVAILABLE'); 
      createdVehicleId = res.body.data.vehicle.id;
    });
  });

  describe('GET /api/vehicles', () => {
    it('should get list of vehicles for regular USER (200)', async () => {
      const res = await request(app)
        .get('/api/vehicles') 
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.data).toBeInstanceOf(Array);
      expect(res.body.data.data.length).toBeGreaterThan(0);
    });

    it('should get vehicle by ID for regular USER (200)', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${createdVehicleId}`) 
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.vehicle.id).toBe(createdVehicleId);
    });
  });

  describe('POST /api/vehicles/:vehicleId/trips/start & PATCH /api/vehicles/trips/:id/end', () => {
    it('should fail to start trip for regular USER (403)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/trips/start`) //
        .set('Authorization', `Bearer ${userToken}`)
        .send({ startLat: -6.2, startLng: 106.8 });
      expect(res.statusCode).toBe(403);
    });

    it('should start a new trip for ADMIN (201)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/trips/start`) 
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ startLat: -6.2, startLng: 106.8 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.trip.status).toBe('ACTIVE');
      createdTripId = res.body.data.trip.id;

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: createdVehicleId },
      });
      expect(vehicle?.status).toBe('ON_TRIP'); 
    });

    it('should fail to end trip for regular USER (403)', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/trips/${createdTripId}/end`) 
        .set('Authorization', `Bearer ${userToken}`)
        .send({ endLat: -6.3, endLng: 106.9, distance: 50, fuelUsed: 5 });
      expect(res.statusCode).toBe(403);
    });

    it('should end the trip for ADMIN (200)', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/trips/${createdTripId}/end`) 
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          endLat: -6.3,
          endLng: 106.9,
          distance: 50,
          fuelUsed: 5,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.trip.status).toBe('COMPLETED');

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: createdVehicleId },
      });
      expect(vehicle?.status).toBe('AVAILABLE'); 
    });
  });


  describe('DELETE /api/vehicles/:id', () => {
    it('should fail to delete vehicle for regular USER (403)', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${createdVehicleId}`) 
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should delete vehicle for ADMIN (200)', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${createdVehicleId}`) 
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: createdVehicleId },
      });
      expect(vehicle).toBeNull();
    });
  });
});