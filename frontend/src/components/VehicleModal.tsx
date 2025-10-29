import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle.service';
import { Button } from './ui/Button';

interface VehicleModalProps {
  vehicleId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ 
  vehicleId, 
  isOpen, 
  onClose 
}) => {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehicleService.getVehicle(vehicleId!),
    enabled: !!vehicleId && isOpen,
  });

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ON_TRIP': return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
      case 'LOADING': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Vehicle Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : vehicle ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">License Plate</label>
                  <p className="text-lg font-semibold">{vehicle.licensePlate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <p className="text-lg">{vehicle.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <p className="text-lg">{vehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Year</label>
                  <p className="text-lg">{vehicle.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Color</label>
                  <p className="text-lg">{vehicle.color}</p>
                </div>
              </div>

              {/* Fuel & Odometer */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fuel Level</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${vehicle.fuelLevel || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{vehicle.fuelLevel || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Odometer</label>
                    <p className="text-lg">{vehicle.odometer?.toLocaleString() || 0} km</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {(vehicle.latitude && vehicle.longitude) && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Current Location</h3>
                  <p className="text-sm">
                    Lat: {vehicle.latitude}, Lng: {vehicle.longitude}
                  </p>
                </div>
              )}

              {/* Recent Trips */}
              {vehicle.trips && vehicle.trips.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Recent Trips</h3>
                    <div className="space-y-2">
                    {vehicle.trips.slice(0, 3).map((trip) => (
                        <div key={trip.id} className="flex justify-between text-sm">
                        <span>{new Date(trip.startTime).toLocaleDateString()}</span>
                        <span className={trip.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}>
                            {trip.status}
                        </span>
                        </div>
                    ))}
                    </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Recent Trips</h3>
            <p className="text-sm text-gray-500">No recent trips</p>
        </div>
          )}
        </div>
      </div>
    </div>
  );
};