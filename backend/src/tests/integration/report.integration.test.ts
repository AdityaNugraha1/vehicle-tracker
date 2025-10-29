import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app'; //
import { PrismaClient, UserRole } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

let adminToken: string;
let adminUserId: string;
let generatedReportId: string;
let generatedReportFilename: string;

beforeAll(async () => {
  const adminRes = await request(app).post('/api/auth/register').send({
    email: `report-admin-${Date.now()}@test.com`,
    password: 'Password123',
    name: 'Report Admin',
    role: UserRole.ADMIN,
  });
  adminToken = adminRes.body.data.tokens.accessToken;
  adminUserId = adminRes.body.data.user.id;
});

afterAll(async () => {
  if (generatedReportId)
    await prisma.report
      .delete({ where: { id: generatedReportId } })
      .catch(() => {});
  if (adminUserId)
    await prisma.user.delete({ where: { id: adminUserId } }).catch(() => {});
  await prisma.$disconnect();

  if (generatedReportFilename) {
    const filepath = path.join(
      process.cwd(),
      'reports',
      generatedReportFilename,
    );
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
});

describe('Report API Integration Tests', () => {
 
  describe('POST /api/reports/trip-summary', () => {
    it('should generate a trip summary report (200)', async () => {
      const res = await request(app)
        .post('/api/reports/trip-summary') 
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.downloadUrl).toContain('.xlsx');

      const urlParts = res.body.data.downloadUrl.split('/');
      generatedReportFilename = urlParts[urlParts.length - 1];
      generatedReportId = res.body.data.report.id;
    });
  });

  describe('GET /api/reports', () => {
    it('should get list of generated reports (200)', async () => {
      const res = await request(app)
        .get('/api/reports') 
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.reports).toBeInstanceOf(Array);
      expect(res.body.data.reports.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/reports/download/:filename', () => {
    it('should download the generated report file (200)', async () => {
      const res = await request(app)
        .get(`/api/reports/download/${generatedReportFilename}`) 
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.header['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      );
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('should delete the report (200)', async () => {
      await prisma.report.update({
        where: { id: generatedReportId },
        data: { filePath: '' },
      });

      const res = await request(app)
        .delete(`/api/reports/${generatedReportId}`) 
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Report deleted successfully');
    });
  });
});