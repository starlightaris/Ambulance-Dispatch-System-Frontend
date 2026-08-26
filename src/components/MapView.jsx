import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';


function FitBounds({ nodes }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (nodes.length && !fitted.current) {
      const bounds = nodes.map((n) => [n.latitude, n.longitude]);
      map.fitBounds(bounds, { padding: [40, 40] });
      fitted.current = true;
    }
  }, [nodes, map]);

  return null;
}

export default function MapView({ nodes, edges, ambulances, blindSpots, threshold, lastUpdated, flyToTarget }) {
  const nodesByName = new Map(nodes.map((n) => [n.name, n]));
  const mapRef = useRef(null);

  useEffect(() => {
    if (flyToTarget && mapRef.current) {
      mapRef.current.flyTo([flyToTarget.latitude, flyToTarget.longitude], 15);
    }
  }, [flyToTarget]);

  return (
      <main className="map-area">
        <MapContainer
            center={[0, 0]}
            zoom={2}
            style={{ width: '100%', height: '100%' }}
            ref={mapRef}
        >
          {/* Modern, soft-light Voyager tile set from CARTO */}
          <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
          />
          <FitBounds nodes={nodes} />

          {edges.map((e) => {
            const from = nodesByName.get(e.fromNode);
            const to = nodesByName.get(e.toNode);
            if (!from || !to) return null;
            return (
                <Polyline
                    key={e.id}
                    positions={[[from.latitude, from.longitude], [to.latitude, to.longitude]]}
                    pathOptions={{
                      color: e.blocked ? '#e11d48' : '#64748b',
                      weight: e.blocked ? 2.5 : 1.8,
                      dashArray: e.blocked ? '4,4' : null,
                      opacity: e.blocked ? 0.9 : 0.65
                    }}
                >
                  <Popup>
                    <div className="popup-title">{e.fromNode} → {e.toNode}</div>
                    <div className="popup-row">{e.travelTimeMinutes.toFixed(1)} min · {e.distanceKm.toFixed(2)} km</div>
                    <div className="popup-row">{e.blocked ? 'BLOCKED' : 'open'}</div>
                  </Popup>
                </Polyline>
            );
          })}

          {nodes.map((n) => (
              <CircleMarker
                  key={n.id}
                  center={[n.latitude, n.longitude]}
                  radius={4}
                  pathOptions={{ color: '#4f46e5', weight: 1.5, fillColor: '#6366f1', fillOpacity: 0.9 }}
              >
                <Popup>
                  <div className="popup-title">{n.name}</div>
                  <div className="popup-row">id: {n.id}</div>
                  <div className="popup-row">{n.latitude.toFixed(5)}, {n.longitude.toFixed(5)}</div>
                </Popup>
              </CircleMarker>
          ))}

          {ambulances.filter((a) => a.latitude != null && a.longitude != null).map((a) => {
            const color = a.status === 'AVAILABLE' ? '#059669' : '#d97706';
            return (
                <CircleMarker
                    key={a.id}
                    center={[a.latitude, a.longitude]}
                    radius={7}
                    pathOptions={{ color, weight: 2, fillColor: color, fillOpacity: 0.45 }}
                >
                  <Popup>
                    <div className="popup-title">{a.vehicleNumber}</div>
                    <div className="popup-row">status: {a.status}</div>
                    <div className="popup-row">at: {a.currentLocationNode}</div>
                  </Popup>
                </CircleMarker>
            );
          })}

          {blindSpots.map((n) => (
              <CircleMarker
                  key={`blind-${n.id}`}
                  center={[n.latitude, n.longitude]}
                  radius={9}
                  pathOptions={{ color: '#e11d48', weight: 2, fillColor: '#e11d48', fillOpacity: 0.35 }}
              >
                <Popup>
                  <div className="popup-title">⚠ Blind spot: {n.name}</div>
                  <div className="popup-row">Beyond threshold of {threshold.toFixed(1)} min from any available ambulance</div>
                </Popup>
              </CircleMarker>
          ))}
        </MapContainer>

        <div className="map-badge">
          {lastUpdated ? `updated ${lastUpdated}` : 'not loaded yet'}
        </div>
      </main>
  );
}