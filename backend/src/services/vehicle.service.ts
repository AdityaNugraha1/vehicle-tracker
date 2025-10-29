import { PrismaClient, VehicleStatus, TripStatus, MaintenanceStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class VehicleService {
  static async getAllVehicles(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = search ? {
      OR: [
        { licensePlate: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { brand: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { model: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
      ]
    } : {};

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          trips: {
            take: 1,
            orderBy: { startTime: 'desc' },
            where: { status: TripStatus.ACTIVE }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vehicle.count({ where })
    ]);

    return {
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

static async getAvailableVehicles() {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          status: 'AVAILABLE' 
        },
        select: {
          id: true,
          licensePlate: true,
          brand: true,
          model: true,
          fuelLevel: true
        },
        orderBy: {
          licensePlate: 'asc'
        }
      });
      return vehicles;
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      throw new Error('Could not fetch available vehicles');
    }
  }
  static async getVehicleById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        trips: {
          orderBy: { startTime: 'desc' },
          take: 10
        }
      }
    });
  }

  static async createVehicle(data: {
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    userId: string;
    fuelLevel?: number;
    odometer?: number;
  }) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: data.licensePlate }
    });

    if (existingVehicle) {
      throw new Error('Vehicle with this license plate already exists');
    }

    return prisma.vehicle.create({
      data: {
        licensePlate: data.licensePlate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        fuelLevel: data.fuelLevel,
        odometer: data.odometer,
        userId: data.userId,
        status: VehicleStatus.AVAILABLE
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  static async updateVehicle(id: string, data: {
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    status?: VehicleStatus;
    fuelLevel?: number;
    odometer?: number;
    latitude?: number;
    longitude?: number;
  }) {
    return prisma.vehicle.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

static async deleteVehicle(id: string) {
    const activeTrips = await prisma.trip.count({
      where: {
        vehicleId: id,
        status: TripStatus.ACTIVE
      }
    });

    if (activeTrips > 0) {
      throw new Error('Cannot delete vehicle with active trips');
    }

    const activeMaintenance = await prisma.maintenance.count({
        where: {
            vehicleId: id,
            NOT: { status: 'COMPLETED' }
        }
    });

    if (activeMaintenance > 0) {
        throw new Error('Cannot delete vehicle with pending or in-progress maintenance');
    }

    await prisma.$transaction([
      prisma.report.deleteMany({ where: { vehicleId: id } }), // Hapus laporan dulu
      prisma.trip.deleteMany({ where: { vehicleId: id } }),
      prisma.maintenance.deleteMany({ where: { vehicleId: id } })
    ]);

    return prisma.vehicle.delete({
      where: { id }
    });
  }

  static async updateVehicleLocation(id: string, latitude: number, longitude: number) {
    return prisma.vehicle.update({
      where: { id },
      data: {
        latitude,
        longitude
      }
    });
  }

  static async getVehicleStats() {
    const [
      totalVehicles,
      availableVehicles,
      onTripVehicles,
      maintenanceVehicles
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.MAINTENANCE } })
    ]);

    return {
      totalVehicles,
      availableVehicles,
      onTripVehicles,
      maintenanceVehicles,
      utilizationRate: totalVehicles > 0 ? (onTripVehicles / totalVehicles) * 100 : 0
    };
  }

  static async searchVehicles(criteria: {
    status?: VehicleStatus;
    brand?: string;
    model?: string;
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};

    if (criteria.status) where.status = criteria.status;
    if (criteria.brand) where.brand = { contains: criteria.brand, mode: 'insensitive' as Prisma.QueryMode };
    if (criteria.model) where.model = { contains: criteria.model, mode: 'insensitive' as Prisma.QueryMode };
    if (criteria.year) where.year = criteria.year;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vehicle.count({ where })
    ]);

    return {
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}