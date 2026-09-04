import React from 'react';

const formatEquipment = (equipment = []) =>
  equipment.length === 0 ? 'None' : equipment.map((item) => item.replace(/_/g, ' ')).join(', ');

<<<<<<< Updated upstream
export default function AmbulanceMatcher({ emergency, matches, isLoading, error, onDispatch, isDispatching, summaryText }) {
  if (!emergency) {
=======
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

export default function AmbulanceMatcher({ ambulances }) {
  if (!ambulances || ambulances.length === 0) {
>>>>>>> Stashed changes
    return (
      <div className="ra-panel ra-panel-empty">
        <h3 className="ra-panel-title">Fleet Status</h3>
        <p className="ra-panel-empty-text">No ambulances found in the network.</p>
      </div>
    );
  }

<<<<<<< Updated upstream
  const required = emergency.requiredEquipment || [];

  if (isLoading) {
    return (
      <div className="resource-panel">
        <div className="panel-heading">
          <h3>Ambulance match</h3>
        </div>
        <p>Asking the dispatch scheduler for the current ranking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resource-panel">
        <div className="panel-heading">
          <h3>Ambulance match</h3>
        </div>
        <div className="no-match-box">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="resource-panel">
        <div className="panel-heading">
          <h3>Ambulance match</h3>
        </div>
        <div className="no-match-box">
          <p>No available ambulance covers all required equipment for this emergency.</p>
          <ul>
            {required.map((item) => (
              <li key={item}>{item.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const bestMatch = matches[0];

=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

      {/*
        These numbers (travelMinutes, extraEquipmentCount, score) come straight from
        GET /api/v1/calls/{id}/candidates - the same greedy-scheduler + shortest-path
        computation that POST /dispatch actually commits to. Nothing here is estimated
        client-side.
      */}
      {matches.map((match, index) => (
        <div key={match.ambulanceId} className={`match-card ${index === 0 ? 'winner' : ''}`}>
          <div className="match-header-row">
            <div>
              <span className="match-badge">#{index + 1}</span>
              <h4>{match.vehicleNumber}</h4>
            </div>
            <div className="score-box">score {match.score.toFixed(1)}</div>
          </div>

          <div className="match-grid">
            <div>
              <span className="mini-label">Current location</span>
              <strong>{match.currentLocationNode}</strong>
            </div>
            <div>
              <span className="mini-label">Travel time</span>
              <strong>{match.travelMinutes.toFixed(1)} min</strong>
            </div>
            <div>
              <span className="mini-label">Status</span>
              <strong>{match.status}</strong>
            </div>
          </div>

          <div className="coverage-block">
            <span className="mini-label">Required equipment</span>
            <p>{formatEquipment(required)}</p>
          </div>

          <div className="coverage-block">
            <span className="mini-label">Ambulance equipment</span>
            <p>{formatEquipment(match.equipment)}</p>
          </div>

          <div className="match-reason">
            <span className="mini-label">Decision logic</span>
            <p>
              Covers every required piece of equipment ({formatEquipment(required)}) and carries{' '}
              {match.extraEquipmentCount} extra resource(s). Real shortest-path travel time from{' '}
              {match.currentLocationNode} to {emergency.locationNode} is {match.travelMinutes.toFixed(1)} minutes.
            </p>
          </div>
        </div>
      ))}

      {bestMatch ? (
        <div className="winning-callout">
          <strong>Best dispatch decision:</strong> {bestMatch.vehicleNumber} is selected because it covers every
          required clinical resource and has the lowest fitness score ({bestMatch.score.toFixed(1)}) for the
          emergency at {emergency.locationNode}. This is the same ranking the backend will act on if dispatched now -
          it can only change if the fleet changes in the meantime.
        </div>
      ) : null}
=======
>>>>>>> Stashed changes
    </div>
  );
}
