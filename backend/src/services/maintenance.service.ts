import { Prisma, PrismaClient, MaintenanceStatus, MaintenanceType } from '@prisma/client';

const prisma = new PrismaClient();

export class MaintenanceService {
  static async getMaintenance(filters: {
    vehicleId?: string;
    status?: MaintenanceStatus;
    type?: MaintenanceType;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceWhereInput = {};

    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [maintenance, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              brand: true,
              model: true,
              status: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.maintenance.count({ where })
    ]);

    return {
      maintenance,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async createMaintenance(data: {
    vehicleId: string;
    type: MaintenanceType;
    description: string;
    cost?: number;
    date?: Date;
  }) {
    console.log('Creating maintenance with data:', data);

    if (!data.vehicleId) {
      throw new Error('Vehicle ID is required');
    }

    if (!data.type) {
      throw new Error('Maintenance type is required');
    }

    if (!data.description) {
      throw new Error('Description is required');
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId }
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        description: data.description,
        cost: data.cost,
        date: data.date || new Date(),
        status: MaintenanceStatus.SCHEDULED
      },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
            status: true
          }
        }
      }
    });

    const criticalMaintenanceTypes: MaintenanceType[] = [
      MaintenanceType.ENGINE_REPAIR,
      MaintenanceType.BRAKE_SERVICE,
      MaintenanceType.TIRE_REPLACEMENT
    ];

    if (criticalMaintenanceTypes.includes(data.type)) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: 'MAINTENANCE' }
      });
    }

    return maintenance;
  }

  static async updateMaintenanceStatus(maintenanceId: string, status: MaintenanceStatus) {
    console.log('Updating maintenance status:', { maintenanceId, status });

    if (!maintenanceId) {
      throw new Error('Maintenance ID is required');
    }

    const maintenance = await prisma.maintenance.findUnique({
      where: { id: maintenanceId },
      include: {
        vehicle: true
      }
    });

    if (!maintenance) {
      throw new Error('Maintenance record not found');
    }

    const updatedMaintenance = await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: { status },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true,
            status: true
          }
        }
      }
    });

    if (status === MaintenanceStatus.COMPLETED && maintenance.vehicle.status === 'MAINTENANCE') {
      await prisma.vehicle.update({
        where: { id: maintenance.vehicleId },
        data: { status: 'AVAILABLE' }
      });
    }

    return updatedMaintenance;
  }

  static async completeMaintenance(maintenanceId: string) {
    return this.updateMaintenanceStatus(maintenanceId, MaintenanceStatus.COMPLETED);
  }

  static async startMaintenance(maintenanceId: string) {
    return this.updateMaintenanceStatus(maintenanceId, MaintenanceStatus.IN_PROGRESS);
  }

  static async getMaintenanceStats() {
    const [
      totalMaintenance,
      scheduledMaintenance,
      inProgressMaintenance,
      completedMaintenance,
      totalCost
    ] = await Promise.all([
      prisma.maintenance.count(),
      prisma.maintenance.count({ where: { status: MaintenanceStatus.SCHEDULED } }),
      prisma.maintenance.count({ where: { status: MaintenanceStatus.IN_PROGRESS } }),
      prisma.maintenance.count({ where: { status: MaintenanceStatus.COMPLETED } }),
      prisma.maintenance.aggregate({
        _sum: {
          cost: true
        },
        where: {
          status: MaintenanceStatus.COMPLETED
        }
      })
    ]);

    return {
      totalMaintenance,
      scheduledMaintenance,
      inProgressMaintenance,
      completedMaintenance,
      totalCost: totalCost._sum.cost || 0,
      completionRate: totalMaintenance > 0 ? (completedMaintenance / totalMaintenance) * 100 : 0
    };
  }
}