import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';

// Re-fits the viewport whenever the set of points to show changes — the full
// node list on first load, then just the route once one's been found.
function FitBounds({ nodes }) {
  const map = useMap();

  useEffect(() => {
    if (nodes.length) {
      const bounds = nodes.map((n) => [n.latitude, n.longitude]);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
  }, [nodes, map]);

  return null;
}

/**
 * Plots the road network and, once a route has been found, highlights the
 * A* path returned by POST /api/v1/routes on top of it — start (green),
 * intermediate hops (indigo), destination (red) — instead of leaving the
 * result as a plain coordinate list with no spatial context.
 */
export default function RouteMap({ allNodes, route }) {
  const hasRoute = route.length > 0;
  const routeLatLngs = route.map((n) => [n.latitude, n.longitude]);
  const start = hasRoute ? route[0] : null;
  const destination = hasRoute ? route[route.length - 1] : null;
  const waypoints = hasRoute ? route.slice(1, -1) : [];
  const fitTarget = hasRoute ? route : allNodes;

  return (
    <div className="routing-map-area">
      <MapContainer center={[0, 0]} zoom={2} style={{ width: '100%', height: '100%' }}>
        {/* Modern, soft-light Voyager tile set from CARTO — same as Network Detection's map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        />
        <FitBounds nodes={fitTarget} />

        {allNodes.map((n) => (
          <CircleMarker
            key={n.id}
            center={[n.latitude, n.longitude]}
            radius={3}
            pathOptions={{ color: '#94a3b8', weight: 1, fillColor: '#cbd5e1', fillOpacity: 0.6 }}
          >
            <Popup>{n.name}</Popup>
          </CircleMarker>
        ))}

        {hasRoute && (
          <Polyline positions={routeLatLngs} pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.9 }} />
        )}

        {waypoints.map((n, i) => (
          <CircleMarker
            key={n.id}
            center={[n.latitude, n.longitude]}
            radius={5}
            pathOptions={{ color: '#4f46e5', weight: 2, fillColor: '#6366f1', fillOpacity: 0.9 }}
          >
            <Popup>{i + 2}. {n.name}</Popup>
          </CircleMarker>
        ))}

        {start && (
          <CircleMarker
            center={[start.latitude, start.longitude]}
            radius={8}
            pathOptions={{ color: '#059669', weight: 2, fillColor: '#059669', fillOpacity: 0.9 }}
          >
            <Popup>Start: {start.name}</Popup>
          </CircleMarker>
        )}

        {destination && (
          <CircleMarker
            center={[destination.latitude, destination.longitude]}
            radius={8}
            pathOptions={{ color: '#e11d48', weight: 2, fillColor: '#e11d48', fillOpacity: 0.9 }}
          >
            <Popup>Destination: {destination.name}</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {!hasRoute && (
        <div className="routing-map-badge">Select a start and destination, then Find Route</div>
      )}
    </div>
  );
}
