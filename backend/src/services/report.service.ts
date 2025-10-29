import { PrismaClient, VehicleStatus, TripStatus, ReportType } from '@prisma/client';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const prisma = new PrismaClient();

export class ReportService {
  static async generateVehicleUtilizationReport(dateRange: { start: Date; end: Date }, userId: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicle Utilization');

    worksheet.columns = [
      { header: 'License Plate', key: 'licensePlate', width: 15 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Model', key: 'model', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Total Trips', key: 'totalTrips', width: 12 },
      { header: 'Total Distance (km)', key: 'totalDistance', width: 18 },
      { header: 'Total Fuel Used (L)', key: 'totalFuelUsed', width: 18 },
      { header: 'Utilization Rate (%)', key: 'utilizationRate', width: 16 },
      { header: 'Avg Fuel Efficiency', key: 'avgEfficiency', width: 18 }
    ];

    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: {
          where: {
            startTime: {
              gte: dateRange.start,
              lte: dateRange.end
            },
            status: TripStatus.COMPLETED
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    for (const vehicle of vehicles) {
      const totalTrips = vehicle.trips.length;
      const totalDistance = vehicle.trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
      const totalFuelUsed = vehicle.trips.reduce((sum, trip) => sum + (trip.fuelUsed || 0), 0);
      const avgEfficiency = totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;
      
      const utilizationRate = totalTrips > 0 ? Math.min(100, (totalTrips * 20)) : 0;

      worksheet.addRow({
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        status: vehicle.status,
        totalTrips,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalFuelUsed: Math.round(totalFuelUsed * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        avgEfficiency: Math.round(avgEfficiency * 100) / 100
      });
    }

    worksheet.addRow({});
    worksheet.addRow({
      licensePlate: 'TOTAL',
      totalTrips: vehicles.reduce((sum, v) => sum + v.trips.length, 0),
      totalDistance: vehicles.reduce((sum, v) => sum + v.trips.reduce((s, t) => s + (t.distance || 0), 0), 0),
      totalFuelUsed: vehicles.reduce((sum, v) => sum + v.trips.reduce((s, t) => s + (t.fuelUsed || 0), 0), 0)
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vehicle-utilization-${timestamp}.xlsx`;
    const filepath = path.join(__dirname, '../../reports', filename);

    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    await workbook.xlsx.writeFile(filepath);

    const report = await prisma.report.create({
      data: {
        title: `Vehicle Utilization Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
        type: ReportType.VEHICLE_UTILIZATION,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        filePath: filepath,
        generatedBy: {
          connect: { id: userId }
        }
      }
    });

    return {
      report,
      filepath,
      filename
    };
  }

  static async generateMaintenanceReport(userId: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Maintenance Report');

    worksheet.columns = [
      { header: 'License Plate', key: 'licensePlate', width: 15 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Model', key: 'model', width: 15 },
      { header: 'Maintenance Type', key: 'type', width: 20 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Cost (IDR)', key: 'cost', width: 15 }
    ];

    const maintenanceRecords = await prisma.maintenance.findMany({
      include: {
        vehicle: {
          select: {
            licensePlate: true,
            brand: true,
            model: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    for (const record of maintenanceRecords) {
      worksheet.addRow({
        licensePlate: record.vehicle.licensePlate,
        brand: record.vehicle.brand,
        model: record.vehicle.model,
        type: record.type,
        description: record.description,
        date: record.date.toLocaleDateString(),
        status: record.status,
        cost: record.cost ? `Rp ${record.cost.toLocaleString()}` : 'N/A'
      });
    }

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE4E1' }
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `maintenance-report-${timestamp}.xlsx`;
    const filepath = path.join(__dirname, '../../reports', filename);

    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    await workbook.xlsx.writeFile(filepath);

    const report = await prisma.report.create({
      data: {
        title: `Maintenance Report - ${new Date().toLocaleDateString()}`,
        type: ReportType.MAINTENANCE_HISTORY,
        filePath: filepath,
        generatedBy: {
          connect: { id: userId }
        }
      }
    });

    return {
      report,
      filepath,
      filename
    };
  }

  static async generateTripSummaryReport(dateRange: { start: Date; end: Date }, userId: string) {
    const workbook = new ExcelJS.Workbook();
    
    const summarySheet = workbook.addWorksheet('Trip Summary');
    const detailSheet = workbook.addWorksheet('Trip Details');

    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    const tripStats = await prisma.trip.findMany({
      where: {
        startTime: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        status: TripStatus.COMPLETED
      },
      include: {
        vehicle: {
          select: {
            licensePlate: true,
            brand: true,
            model: true
          }
        }
      }
    });

    const totalTrips = tripStats.length;
    const totalDistance = tripStats.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalFuelUsed = tripStats.reduce((sum, trip) => sum + (trip.fuelUsed || 0), 0);
    const avgFuelEfficiency = totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;

    summarySheet.addRow({ metric: 'Total Trips', value: totalTrips });
    summarySheet.addRow({ metric: 'Total Distance (km)', value: Math.round(totalDistance * 100) / 100 });
    summarySheet.addRow({ metric: 'Total Fuel Used (L)', value: Math.round(totalFuelUsed * 100) / 100 });
    summarySheet.addRow({ metric: 'Average Fuel Efficiency (km/L)', value: Math.round(avgFuelEfficiency * 100) / 100 });
    summarySheet.addRow({ metric: 'Report Period', value: `${dateRange.start.toDateString()} - ${dateRange.end.toDateString()}` });

    detailSheet.columns = [
      { header: 'Trip ID', key: 'id', width: 15 },
      { header: 'Vehicle', key: 'vehicle', width: 20 },
      { header: 'Start Time', key: 'startTime', width: 20 },
      { header: 'End Time', key: 'endTime', width: 20 },
      { header: 'Distance (km)', key: 'distance', width: 15 },
      { header: 'Fuel Used (L)', key: 'fuelUsed', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    for (const trip of tripStats) {
      detailSheet.addRow({
        id: trip.id.substring(0, 8),
        vehicle: `${trip.vehicle.licensePlate} - ${trip.vehicle.brand} ${trip.vehicle.model}`,
        startTime: trip.startTime.toLocaleString(),
        endTime: trip.endTime?.toLocaleString() || 'N/A',
        distance: Math.round((trip.distance || 0) * 100) / 100,
        fuelUsed: Math.round((trip.fuelUsed || 0) * 100) / 100,
        status: trip.status
      });
    }

    [summarySheet, detailSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `trip-summary-${timestamp}.xlsx`;
    const filepath = path.join(__dirname, '../../reports', filename);

    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    await workbook.xlsx.writeFile(filepath);

    const report = await prisma.report.create({
      data: {
        title: `Trip Summary Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
        type: ReportType.TRIP_SUMMARY,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        filePath: filepath,
        generatedBy: {
          connect: { id: userId }
        }
      }
    });

    return {
      report,
      filepath,
      filename
    };
  }

  static async getGeneratedReports(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: {
          userId: userId
        },
        include: {
          generatedBy: {
            select: {
              name: true,
              email: true
            }
          },
          vehicle: {
            select: {
              licensePlate: true,
              brand: true,
              model: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.report.count({
        where: {
          userId: userId
        }
      })
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getReportById(id: string, userId: string) {
  return prisma.report.findFirst({
    where: {
      id: id,
      userId: userId
    },
    include: {
      generatedBy: {
        select: {
          name: true,
          email: true
        }
      },
      vehicle: {
        select: {
          licensePlate: true,
          brand: true,
          model: true
        }
      }
    }
  });
}

static async deleteReport(id: string) {

}

}