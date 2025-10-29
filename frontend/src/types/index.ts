// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  createdAt: string;
  updatedAt: string;
}

// src/types/index.ts
export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'LOADING';
  fuelLevel?: number;
  odometer?: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  // Tambahkan trips dan maintenance
  trips?: Trip[];
  maintenance?: Maintenance[];
}

// src/types/index.ts - Pastikan Trip type sesuai
export interface Trip {
  id: string;
  vehicleId: string;
  vehicle: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
  };
  startTime: string;
  endTime?: string;
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  distance?: number;
  fuelUsed?: number;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
}

export type VehicleStatus =
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE'
  | 'LOADING';

export interface Maintenance {
  id: string;
  vehicleId: string;
  vehicle: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    status: VehicleStatus;
  };
  type: 'ROUTINE_CHECK' | 'OIL_CHANGE' | 'TIRE_REPLACEMENT' | 'BRAKE_SERVICE' | 'ENGINE_REPAIR' | 'OTHER';
  description: string;
  cost?: number;
  date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface MaintenanceStats {
  totalMaintenance: number;
  scheduledMaintenance: number;
  inProgressMaintenance: number;
  completedMaintenance: number;
  totalCost: number;
  completionRate: number;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
// src/types/index.ts
export interface PaginatedResponse<T = any> {
  data: T[]; // atau vehicles: T[] - sesuaikan dengan backend
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tambahkan interface untuk backend response structure
export interface VehiclesResponse {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}