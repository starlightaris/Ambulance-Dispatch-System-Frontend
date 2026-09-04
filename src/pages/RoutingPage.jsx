import React, { useState } from 'react';
import { findRoute } from '../api/routing.api.js';
import '../styles/routing.css';

// TODO: once a "list locations" endpoint exists on the backend, replace
// these two number inputs with <select> dropdowns populated from it.
export default function RoutingPage() {
  const [startLocationId, setStartLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!startLocationId || !destinationLocationId) {
      setError('Please enter both a start and destination location ID.');
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
      <h1>Route Optimization</h1>

      <form onSubmit={handleSubmit} className="routing-form">
        <label>
          Start location ID
          <input
            type="number"
            value={startLocationId}
            onChange={(e) => setStartLocationId(e.target.value)}
            placeholder="e.g. 1"
          />
        </label>

        <label>
          Destination location ID
          <input
            type="number"
            value={destinationLocationId}
            onChange={(e) => setDestinationLocationId(e.target.value)}
            placeholder="e.g. 2"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Finding route…' : 'Find Route'}
        </button>
      </form>

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
  );
}