import React from 'react';

// Small "connected / disconnected" pill. Used by module pages that poll a
// backend endpoint and want to show live status (see network-detection's
// Sidebar for an example).
export default function StatusBadge({ connected, connectedLabel, disconnectedLabel }) {
  return (
    <div className="status-row">
      <span className={`dot ${connected ? '' : 'err'}`}></span>
      <span>{connected ? connectedLabel : disconnectedLabel}</span>
    </div>
  );
}
