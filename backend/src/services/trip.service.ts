import { Prisma, PrismaClient, TripStatus, VehicleStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class TripService {
  static async startTrip(data: {
    vehicleId: string;
    startLat: number;
    startLng: number;
  }) {
    console.log('TripService.startTrip called with data:', data);

    if (!data.vehicleId) {
      throw new Error('Vehicle ID is required');
    }

    if (typeof data.startLat !== 'number' || typeof data.startLng !== 'number') {
      throw new Error('Valid startLat and startLng are required');
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { 
        id: data.vehicleId
      },
      include: {
        trips: {
          where: {
            status: TripStatus.ACTIVE
          }
        }
      }
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new Error(`Vehicle is not available. Current status: ${vehicle.status}`);
    }

    if (vehicle.trips.length > 0) {
      throw new Error('Vehicle already has an active trip');
    }

    const trip = await prisma.trip.create({
      data: {
        vehicleId: data.vehicleId,
        startTime: new Date(),
        startLat: data.startLat,
        startLng: data.startLng,
        status: TripStatus.ACTIVE
      },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true
          }
        }
      }
    });

    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { 
        status: VehicleStatus.ON_TRIP,
        latitude: data.startLat,
        longitude: data.startLng
      }
    });

    return trip;
  }

  static async endTrip(tripId: string, data: {
    endLat: number;
    endLng: number;
    distance: number;
    fuelUsed: number;
  }) {
    console.log('TripService.endTrip called with:', { tripId, data });

    if (!tripId) {
      throw new Error('Trip ID is required');
    }

    if (typeof data.endLat !== 'number' || typeof data.endLng !== 'number') {
      throw new Error('Valid endLat and endLng are required');
    }

    if (typeof data.distance !== 'number' || data.distance < 0) {
      throw new Error('Valid distance is required');
    }

    if (typeof data.fuelUsed !== 'number' || data.fuelUsed < 0) {
      throw new Error('Valid fuelUsed is required');
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        vehicle: true
      }
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    if (trip.status !== TripStatus.ACTIVE) {
      throw new Error(`Trip is not active. Current status: ${trip.status}`);
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        endTime: new Date(),
        endLat: data.endLat,
        endLng: data.endLng,
        distance: data.distance,
        fuelUsed: data.fuelUsed,
        status: TripStatus.COMPLETED
      },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            brand: true,
            model: true
          }
        }
      }
    });

    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { 
        status: VehicleStatus.AVAILABLE,
        latitude: data.endLat,
        longitude: data.endLng,
        fuelLevel: trip.vehicle.fuelLevel ? Math.max(0, trip.vehicle.fuelLevel - data.fuelUsed) : undefined,
        odometer: trip.vehicle.odometer ? trip.vehicle.odometer + data.distance : undefined
      }
    });

    return updatedTrip;
  }

  static async getTrips(filters: {
    vehicleId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: TripStatus;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TripWhereInput = {};

    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) where.startTime.gte = filters.startDate;
      if (filters.endDate) where.startTime.lte = filters.endDate;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              brand: true,
              model: true
            }
          }
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit
      }),
      prisma.trip.count({ where })
    ]);

    return {
      trips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getTripStats(vehicleId?: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.TripWhereInput = { status: TripStatus.COMPLETED };

    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true
          }
        }
      }
    });

    const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalFuelUsed = trips.reduce((sum, trip) => sum + (trip.fuelUsed || 0), 0);
    const avgFuelEfficiency = totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;

    return {
      totalTrips: trips.length,
      totalDistance,
      totalFuelUsed,
      avgFuelEfficiency,
      trips
    };
  }
}