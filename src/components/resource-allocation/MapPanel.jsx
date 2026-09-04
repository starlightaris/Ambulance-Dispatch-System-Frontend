import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getLocation = (obj) => {
  if (obj.latitude && obj.longitude) {
    return [obj.latitude, obj.longitude];
  }
  return null;
};

export default function MapPanel({ emergencies, ambulances, selectedEmergencyId, routePolyline }) {
  const center = [51.505, -0.09]; // Fallback center

  const markers = useMemo(() => {
    const ambMarkers = ambulances
      .map((amb) => ({
        id: amb.id,
        position: getLocation(amb),
        popup: `Ambulance: ${amb.vehicleNumber} (${amb.status})`,
        type: 'ambulance',
        status: amb.status,
      }))
      .filter((m) => m.position !== null);

    const emMarkers = emergencies
      .map((em) => ({
        id: em.id,
        position: getLocation(em),
        popup: `Emergency: ${em.patient?.name || 'Unknown'} - ${em.patient?.urgencyLevel || 'Unknown'}`,
        type: 'emergency',
        isSelected: em.id === selectedEmergencyId,
      }))
      .filter((m) => m.position !== null);

    return [...ambMarkers, ...emMarkers];
  }, [ambulances, emergencies, selectedEmergencyId]);

  return (
    <div className="ra-map-wrapper">
      <MapContainer center={markers.length > 0 ? markers[0].position : center} zoom={13} scrollWheelZoom={false} className="ra-map-container" style={{ height: '100%', minHeight: '500px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {markers.map((m, i) => (
          <Marker key={`${m.type}-${m.id}-${i}`} position={m.position}>
            <Popup>{m.popup}</Popup>
          </Marker>
        ))}
        {routePolyline && routePolyline.length > 0 && (
          <Polyline positions={routePolyline} color="#3B82F6" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
