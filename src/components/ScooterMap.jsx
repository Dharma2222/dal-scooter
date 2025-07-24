// src/components/ScooterMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function ScooterMap({ scooters }) {
  // center map on first scooter (or fallback coords)
  const center = scooters.length > 0
    ? [scooters[0].latitude, scooters[0].longitude]
    : [44.63873 , -63.590765];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {scooters.map(s => (
        <Marker
          key={s.id}
          position={[s.latitude, s.longitude]}
        >
          <Popup>
            <strong>{s.name}</strong><br/>
            {s.isAvailable ? 'Available' : 'In ride'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
