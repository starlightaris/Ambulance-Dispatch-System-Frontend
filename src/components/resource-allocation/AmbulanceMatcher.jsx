import React from 'react';

const formatEquipment = (equipment = []) =>
  equipment.length === 0 ? 'None' : equipment.map((item) => item.replace(/_/g, ' ')).join(', ');

const getStatusClass = (status) => {
  switch (status) {
    case 'AVAILABLE':
    case 'IDLE':
      return 'ra-status-ok';
    case 'DISPATCHED':
    case 'EN_ROUTE':
      return 'ra-status-info';
    case 'BUSY':
      return 'ra-status-warning';
    case 'OUT_OF_SERVICE':
      return 'ra-status-danger';
    default:
      return 'ra-status-default';
  }
};

export default function AmbulanceMatcher({
  ambulances = [],
  emergency,
  matches = [],
  isLoading,
  error
}) {
  if (!ambulances || ambulances.length === 0) {
    return (
      <div className="ra-panel ra-panel-empty">
        <h3 className="ra-panel-title">Fleet Status</h3>
        <p className="ra-panel-empty-text">No ambulances found in the network.</p>
      </div>
    );
  }

  const required = emergency?.requiredEquipment || [];
  const bestMatch = matches.length > 0 ? matches[0] : null;

  return (
    <div className="ra-panel ra-panel-filled flex-col">
      <div className="ra-panel-header">
        <h3 className="ra-panel-title">Fleet Status</h3>
        <span className="ra-badge ra-badge-neutral">
          {ambulances.length} Units
        </span>
      </div>

      <div className="ra-list-container custom-scrollbar">
        {ambulances.map((ambulance) => {
          const statusClass = getStatusClass(ambulance.status);

          return (
            <div
              key={ambulance.id}
              className="ra-fleet-card"
            >
              <div className="ra-card-header">
                <div className="ra-fleet-ident">
                  <div className="ra-fleet-icon">
                    <svg className="ra-icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 15v1c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="ra-card-title">{ambulance.vehicleNumber}</h4>
                    <span className="ra-card-subtitle">{ambulance.crew || 'Standard Crew'}</span>
                  </div>
                </div>
                <span className={`ra-status-pill ${statusClass}`}>
                  {ambulance.status}
                </span>
              </div>

              <div className="ra-card-grid">
                <div className="ra-meta-box">
                  <span className="ra-meta-label">Current Node</span>
                  <span className="ra-meta-value truncate">{ambulance.currentLocationNode}</span>
                </div>
                <div className="ra-meta-box">
                  <span className="ra-meta-label">Travel ETA</span>
                  <span className="ra-meta-value">{ambulance.travelMinutes || 0} min</span>
                </div>
              </div>

              <div className="ra-card-equipment">
                <span className="ra-equipment-label">Equipment Onboard</span>
                <p className="ra-equipment-value truncate-lines">
                  {formatEquipment(ambulance.equipment)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Match details when an emergency is selected */}
      {emergency && (
        <div className="ra-match-section" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <h4 className="ra-card-title" style={{ marginBottom: '0.75rem' }}>
            Dispatch Ranking for Call #{emergency.id}
          </h4>

          {isLoading && (
            <p className="ra-panel-empty-text">Asking the dispatch scheduler for current ranking...</p>
          )}

          {error && (
            <div className="ra-alert ra-alert-error" style={{ marginBottom: '0.5rem' }}>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && matches.length === 0 && (
            <div className="ra-alert ra-alert-warning">
              <p>No available ambulance covers all required equipment for this emergency.</p>
              {required.length > 0 && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                  Required: {formatEquipment(required)}
                </p>
              )}
            </div>
          )}

          {!isLoading && !error && matches.map((match, index) => (
            <div key={match.ambulanceId} className={`ra-fleet-card ${index === 0 ? 'ra-card-selected' : ''}`} style={{ marginBottom: '0.75rem' }}>
              <div className="ra-card-header">
                <div>
                  <span className="ra-badge ra-badge-pending">#{index + 1}</span>
                  <h4 className="ra-card-title" style={{ display: 'inline', marginLeft: '0.5rem' }}>{match.vehicleNumber}</h4>
                </div>
                <span className="ra-badge ra-badge-neutral">score {match.score.toFixed(1)}</span>
              </div>

              <div className="ra-card-grid" style={{ marginTop: '0.5rem' }}>
                <div className="ra-meta-box">
                  <span className="ra-meta-label">Location</span>
                  <span className="ra-meta-value">{match.currentLocationNode}</span>
                </div>
                <div className="ra-meta-box">
                  <span className="ra-meta-label">Travel ETA</span>
                  <span className="ra-meta-value">{match.travelMinutes.toFixed(1)} min</span>
                </div>
              </div>

              <div className="ra-card-equipment" style={{ marginTop: '0.5rem' }}>
                <span className="ra-equipment-label">Ambulance Equipment</span>
                <p className="ra-equipment-value">{formatEquipment(match.equipment)}</p>
              </div>
            </div>
          ))}

          {bestMatch && (
            <div className="ra-alert ra-alert-success" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <strong>Best dispatch decision:</strong> {bestMatch.vehicleNumber} covers every required clinical resource and has the lowest fitness score ({bestMatch.score.toFixed(1)}).
            </div>
          )}
        </div>
      )}
    </div>
  );
}
