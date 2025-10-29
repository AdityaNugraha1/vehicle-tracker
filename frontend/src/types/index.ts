// src/types/index.ts

// 1. Definisikan tipe Role agar bisa di-import
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; // 2. Gunakan tipe UserRole
  createdAt: string;
  updatedAt: string;
}

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
  trips?: Trip[];
  maintenance?: Maintenance[];
}

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
  type:
    | 'ROUTINE_CHECK'
    | 'OIL_CHANGE'
    | 'TIRE_REPLACEMENT'
    | 'BRAKE_SERVICE'
    | 'ENGINE_REPAIR'
    | 'OTHER';
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

// 3. AuthResponse dibersihkan agar tidak ambigu
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
  role?: UserRole; // 4. Gunakan tipe UserRole
}

// 5. Tipe baru untuk Admin Create User
export interface AdminCreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole; // Wajib
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}