// src/pages/Map.tsx - DIPERBAIKI DENGAN PETA LEAFLET
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle.service';
import type { Vehicle } from '../types';

// 1. Import komponen dari react-leaflet dan leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// 2. Import CSS Leaflet (WAJIB agar peta tampil)
import 'leaflet/dist/leaflet.css';

// 3. Perbaikan untuk ikon marker (masalah umum di React)
// Ini memastikan ikon marker tampil dengan benar
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41], // Ukuran ikon
    iconAnchor: [12, 41], // Titik anchor ikon
    popupAnchor: [1, -34] // Titik anchor popup
});

L.Marker.prototype.options.icon = DefaultIcon;


// 4. Helper component untuk mengubah view peta saat list di-klik
function ChangeView({ center, zoom }: { center: L.LatLngExpression, zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export const Map: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const { 
    data: vehiclesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['all-vehicles-location'],
    queryFn: () => vehicleService.getVehicles(1, 100), 
    refetchInterval: 10000,
  });

  const vehicles = vehiclesResponse?.data || [];
  
  // 5. Tentukan posisi tengah peta (misal: Jakarta)
  const mapCenter: L.LatLngExpression = [-6.2088, 106.8456];

  // 6. Filter kendaraan yang punya lokasi
  const vehiclesWithLocation = vehicles.filter(v => v.latitude && v.longitude);

  if (isLoading) {
    return <div className="p-8 text-center">Loading vehicle locations...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading map: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Tracking</h1>
        <p className="text-gray-600">Live map overview of all vehicle locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Daftar Kendaraan */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-lg font-medium p-4 border-b">Vehicle List ({vehiclesWithLocation.length} / {vehicles.length})</h2>
          <div className="max-h-[600px] overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <li 
                  key={vehicle.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <p className="font-medium">{vehicle.licensePlate}</p>
                  <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'ON_TRIP' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                  {/* Tampilkan jika tidak ada lokasi */}
                  {(!vehicle.latitude || !vehicle.longitude) && (
                    <p className="text-xs text-red-500 mt-1">Location N/A</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Kolom Peta */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6 space-y-4">
          
          {/* 7. Ganti Placeholder dengan MapContainer ASLI */}
          <MapContainer 
            center={mapCenter} 
            zoom={11} 
            style={{ height: '500px', width: '100%', borderRadius: '8px' }}
          >
            {/* Layer Peta (gratis dari OpenStreetMap) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Tampilkan Marker untuk setiap kendaraan */}
            {vehiclesWithLocation.map((vehicle) => (
              <Marker 
                key={vehicle.id} 
                position={[vehicle.latitude!, vehicle.longitude!]}
                // Event saat marker di-klik
                eventHandlers={{
                  click: () => {
                    setSelectedVehicle(vehicle);
                  },
                }}
              >
                <Popup>
                  <b>{vehicle.licensePlate}</b><br />
                  {vehicle.brand} {vehicle.model}<br />
                  Status: {vehicle.status}
                </Popup>
              </Marker>
            ))}

            {/* Component untuk memindahkan fokus peta */}
            {selectedVehicle && selectedVehicle.latitude && selectedVehicle.longitude && (
              <ChangeView 
                center={[selectedVehicle.latitude, selectedVehicle.longitude]} 
                zoom={15} 
              />
            )}
          </MapContainer>
          
          {/* Detail Kendaraan yang Dipilih */}
          {selectedVehicle ? (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-bold text-lg">{selectedVehicle.licensePlate}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <p><strong>Status:</strong> {selectedVehicle.status}</p>
                <p><strong>Fuel:</strong> {selectedVehicle.fuelLevel || 'N/A'}%</p>
                <p><strong>Odometer:</strong> {selectedVehicle.odometer || 'N/A'} km</p>
                <p><strong>Location:</strong> ({selectedVehicle.latitude || 'N/A'}, {selectedVehicle.longitude || 'N/A'})</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Select a vehicle from the list to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
};