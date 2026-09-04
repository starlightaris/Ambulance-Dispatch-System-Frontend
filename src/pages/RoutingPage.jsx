import React, { useEffect, useState } from 'react';
import { findRoute } from '../api/routing.api.js';
import { fetchNodes } from '../api/networkDetection.api.js';
import RouteMap from '../components/routing/RouteMap.jsx';
import 'leaflet/dist/leaflet.css';
import '../styles/routing.css';

export default function RoutingPage() {
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [nodesError, setNodesError] = useState(null);

  const [startLocationId, setStartLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Location picker is fed by the same /api/v1/network/graph/nodes endpoint
  // the Network Detection map already uses — no separate "list locations"
  // endpoint was ever needed.
  useEffect(() => {
    let cancelled = false;
    fetchNodes()
      .then((data) => {
        if (cancelled) return;
        setNodes([...data].sort((a, b) => a.name.localeCompare(b.name)));
        setNodesError(null);
      })
      .catch((err) => {
        if (!cancelled) setNodesError(err.message);
      })
      .finally(() => {
        if (!cancelled) setNodesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sameLocationSelected =
    startLocationId !== '' && startLocationId === destinationLocationId;
  const picking = nodesLoading || Boolean(nodesError);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!startLocationId || !destinationLocationId) {
      setError('Please select both a start and destination location.');
      return;
    }
    if (sameLocationSelected) {
      setError('Start and destination must be different locations.');
      return;
    }

    setLoading(true);
    try {
      const data = await findRoute(
        Number(startLocationId),
        Number(destinationLocationId)
      );
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="routing-page">
      <div className="routing-panel">
        <h1>Route Optimization</h1>

        <form onSubmit={handleSubmit} className="routing-form">
          <label>
            Start location
            <select
              value={startLocationId}
              onChange={(e) => setStartLocationId(e.target.value)}
              disabled={picking}
            >
              <option value="">{nodesLoading ? 'Loading locations…' : 'Select a location'}</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </label>

          <label>
            Destination location
            <select
              value={destinationLocationId}
              onChange={(e) => setDestinationLocationId(e.target.value)}
              disabled={picking}
            >
              <option value="">{nodesLoading ? 'Loading locations…' : 'Select a location'}</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={loading || picking}>
            {loading ? 'Finding route…' : 'Find Route'}
          </button>
        </form>

        {nodesError && (
          <div className="routing-error">
            <span className="dot err" />
            Could not load locations: {nodesError}
          </div>
        )}

        {loading && (
          <div className="status-row">
            <span className="dot" />
            Calculating shortest path…
          </div>
        )}

        {error && (
          <div className="routing-error">
            <span className="dot err" />
            {error}
          </div>
        )}

        {result && (
          <div className="routing-result">
            <h2>Route found ({result.algorithm})</h2>
            <p>
              {result.totalDistanceKm.toFixed(2)} km &middot;{' '}
              {result.totalTravelTimeMinutes.toFixed(1)} min
            </p>

            <ol className="routing-node-list">
              {result.route.map((node) => (
                <li key={node.id}>
                  {node.name}
                  <span className="routing-node-coords">
                    {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <RouteMap allNodes={nodes} route={result?.route ?? []} />
    </div>
  );
}
