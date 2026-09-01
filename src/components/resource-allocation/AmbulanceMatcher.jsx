import React from 'react';

const formatEquipment = (equipment = []) =>
  equipment.length === 0 ? 'No equipment listed' : equipment.map((item) => item.replace(/_/g, ' ')).join(', ');

export default function AmbulanceMatcher({ emergency, matches, onDispatch, isDispatching, summaryText }) {
  if (!emergency) {
    return (
      <div className="resource-panel empty-panel">
        <h3>Allocation logic</h3>
        <p>Select an emergency to review matching ambulances.</p>
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
            {emergency.requiredEquipment.map((item) => (
              <li key={item}>{item.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const bestMatch = matches[0];

  return (
    <div className="resource-panel">
      <div className="panel-heading match-heading">
        <h3>Ambulance match</h3>
        <button type="button" className="dispatch-button" onClick={() => onDispatch()} disabled={isDispatching}>
          {isDispatching ? 'Dispatching...' : 'Dispatch best match'}
        </button>
      </div>

      <div className="selection-summary">
        <div>
          <span className="summary-label">Selected emergency</span>
          <strong>{emergency.patient?.name || 'Unknown patient'}</strong>
        </div>
        <div>
          <span className="summary-label">Why this ambulance</span>
          <strong>{summaryText || 'Equipment match and fastest route.'}</strong>
        </div>
      </div>

      {matches.map((match, index) => (
        <div key={match.ambulance.id} className={`match-card ${index === 0 ? 'winner' : ''}`}>
          <div className="match-header-row">
            <div>
              <span className="match-badge">#{index + 1}</span>
              <h4>{match.ambulance.vehicleNumber}</h4>
            </div>
            <div className="score-box">score {match.score}</div>
          </div>

          <div className="match-grid">
            <div>
              <span className="mini-label">Current location</span>
              <strong>{match.ambulance.currentLocationNode}</strong>
            </div>
            <div>
              <span className="mini-label">Travel time</span>
              <strong>{match.travelMinutes || 0} min</strong>
            </div>
            <div>
              <span className="mini-label">Status</span>
              <strong>{match.ambulance.status}</strong>
            </div>
          </div>

          <div className="coverage-block">
            <span className="mini-label">Required equipment</span>
            <p>{formatEquipment(match.required)}</p>
          </div>

          <div className="coverage-block">
            <span className="mini-label">Ambulance equipment</span>
            <p>{formatEquipment(match.ambulance.equipment)}</p>
          </div>

          <div className="match-reason">
            <span className="mini-label">Decision logic</span>
            <p>
              {match.reason}
            </p>
          </div>
        </div>
      ))}

      {bestMatch ? (
        <div className="winning-callout">
          <strong>Best dispatch decision:</strong> {bestMatch.ambulance.vehicleNumber} is selected because it covers every
          required clinical resource and has the lowest fitness score for the emergency at {emergency.locationNode}.
        </div>
      ) : null}
    </div>
  );
}
