// prisma/seed.ts
import { PrismaClient, UserRole, VehicleStatus } from '@prisma/client';
import { AuthUtils } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.trip.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await AuthUtils.hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vehicle.com',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
    },
  });

  // Create manager user
  const managerPassword = await AuthUtils.hashPassword('manager123');
  const manager = await prisma.user.create({
    data: {
      email: 'manager@vehicle.com',
      password: managerPassword,
      name: 'Fleet Manager',
      role: UserRole.MANAGER,
    },
  });

  // Create regular user
  const userPassword = await AuthUtils.hashPassword('user123');
  const user = await prisma.user.create({
    data: {
      email: 'user@vehicle.com',
      password: userPassword,
      name: 'Regular User',
      role: UserRole.USER,
    },
  });

  // Create realistic delivery fleet vehicles
  const vehicles = [
    // Delivery Vans
    {
      licensePlate: 'B 1234 CD',
      brand: 'Toyota',
      model: 'Hiace',
      year: 2022,
      color: 'White',
      fuelLevel: 85,
      odometer: 45230,
      status: VehicleStatus.ON_TRIP,
      latitude: -6.2088,
      longitude: 106.8456,
      userId: manager.id
    },
    {
      licensePlate: 'B 5678 EF',
      brand: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2021,
      color: 'Silver',
      fuelLevel: 45,
      odometer: 78900,
      status: VehicleStatus.AVAILABLE,
      latitude: -6.2297,
      longitude: 106.6894,
      userId: manager.id
    },
    {
      licensePlate: 'B 9012 GH',
      brand: 'Ford',
      model: 'Transit',
      year: 2023,
      color: 'Blue',
      fuelLevel: 90,
      odometer: 12300,
      status: VehicleStatus.LOADING,
      userId: manager.id
    },
    // Trucks
    {
      licensePlate: 'B 3456 IJ',
      brand: 'Mitsubishi',
      model: 'Fuso',
      year: 2020,
      color: 'Red',
      fuelLevel: 30,
      odometer: 120450,
      status: VehicleStatus.MAINTENANCE,
      userId: manager.id
    },
    {
      licensePlate: 'B 7890 KL',
      brand: 'Hino',
      model: 'Dutro',
      year: 2022,
      color: 'White',
      fuelLevel: 75,
      odometer: 56780,
      status: VehicleStatus.AVAILABLE,
      userId: manager.id
    },
    // Motorcycles for quick delivery
    {
      licensePlate: 'B 1122 MN',
      brand: 'Honda',
      model: 'Beat',
      year: 2023,
      color: 'Black',
      fuelLevel: 60,
      odometer: 8900,
      status: VehicleStatus.ON_TRIP,
      latitude: -6.1751,
      longitude: 106.8650,
      userId: manager.id
    },
    {
      licensePlate: 'B 3344 OP',
      brand: 'Yamaha',
      model: 'NMAX',
      year: 2022,
      color: 'Blue',
      fuelLevel: 80,
      odometer: 15600,
      status: VehicleStatus.AVAILABLE,
      userId: manager.id
    }
  ];

  for (const vehicleData of vehicles) {
    await prisma.vehicle.create({
      data: vehicleData
    });
  }

  // Create sample trips
  const sampleVehicle = await prisma.vehicle.findFirst();
  if (sampleVehicle) {
    // Create completed trips
    await prisma.trip.createMany({
      data: [
        {
          vehicleId: sampleVehicle.id,
          startTime: new Date('2024-01-15T08:00:00Z'),
          endTime: new Date('2024-01-15T12:30:00Z'),
          startLat: -6.2088,
          startLng: 106.8456,
          endLat: -6.1751,
          endLng: 106.8650,
          distance: 25.5,
          fuelUsed: 8.2,
          status: 'COMPLETED'
        },
        {
          vehicleId: sampleVehicle.id,
          startTime: new Date('2024-01-16T09:00:00Z'),
          endTime: new Date('2024-01-16T14:45:00Z'),
          startLat: -6.1751,
          startLng: 106.8650,
          endLat: -6.2297,
          endLng: 106.6894,
          distance: 32.1,
          fuelUsed: 10.5,
          status: 'COMPLETED'
        }
      ]
    });

    // Create active trip
    await prisma.trip.create({
      data: {
        vehicleId: sampleVehicle.id,
        startTime: new Date('2024-01-17T07:30:00Z'),
        startLat: -6.2297,
        startLng: 106.6894,
        status: 'ACTIVE'
      }
    });
  }
const vehiclesForMaintenance = await prisma.vehicle.findMany({ take: 3 });
for (const vehicle of vehiclesForMaintenance) {
  await prisma.maintenance.createMany({
    data: [
      {
        vehicleId: vehicle.id,
        type: 'ROUTINE_CHECK',
        description: 'Regular service and inspection',
        date: new Date('2024-01-10'),
        status: 'COMPLETED',
        cost: 750000
      },
      {
        vehicleId: vehicle.id,
        type: 'OIL_CHANGE',
        description: 'Engine oil and filter replacement',
        date: new Date('2024-01-15'),
        status: 'COMPLETED',
        cost: 450000
      },
      {
        vehicleId: vehicle.id,
        type: 'TIRE_REPLACEMENT',
        description: 'Replace worn tires',
        date: new Date('2024-01-20'),
        status: 'SCHEDULED',
        cost: 1200000
      }
    ]
  });
}

  console.log('🔧 Maintenance records created');
  console.log('✅ Database seeded successfully!');
  console.log('📧 Test users created:');
  console.log(`   Admin: admin@vehicle.com / admin123`);
  console.log(`   Manager: manager@vehicle.com / manager123`);
  console.log(`   User: user@vehicle.com / user123`);
  console.log('🚗 7 vehicles created with realistic delivery fleet data');
  console.log('📍 Sample trips created for testing');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });