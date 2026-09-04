import React from 'react';

const formatEquipment = (equipment = []) =>
  equipment.length === 0 ? 'None' : equipment.map((item) => item.replace(/_/g, ' ')).join(', ');

const getUrgencyClass = (urgency) => {
  const level = String(urgency).toLowerCase();
  if (level.includes('red') || level.includes('critical')) return 'ra-urgency-critical';
  if (level.includes('yellow') || level.includes('high')) return 'ra-urgency-high';
  if (level.includes('green') || level.includes('low') || level.includes('routine')) return 'ra-urgency-low';
  return 'ra-urgency-default';
};

export default function EmergencyList({ emergencies, selectedId, onSelect, onQuickDispatch }) {
  if (!emergencies.length) {
    return (
      <div className="ra-panel ra-panel-empty">
        <h3 className="ra-panel-title">Calls Queue</h3>
        <p className="ra-panel-empty-text">No emergency calls are currently queued.</p>
      </div>
    );
  }

  return (
    <div className="ra-panel ra-panel-filled flex-col">
      <div className="ra-panel-header">
        <h3 className="ra-panel-title">Active Queue</h3>
        <span className="ra-badge ra-badge-pending">
          {emergencies.length} Pending
        </span>
      </div>

      <div className="ra-list-container custom-scrollbar">
        {emergencies.map((emergency) => {
          const patient = emergency.patient || {};
          const isSelected = emergency.id === selectedId;
          const urgencyClass = getUrgencyClass(patient.urgencyLevel || emergency.status);
          const isCritical = String(patient.urgencyLevel).toLowerCase().includes('critical');

          return (
            <div
              key={emergency.id}
              className={`ra-list-card ${isSelected ? 'ra-card-selected' : ''} ${isCritical ? 'ra-animate-pulse' : ''}`}
              onClick={() => onSelect(emergency.id)}
            >
              <div className="ra-card-header">
                <span className="ra-card-id">#{emergency.id}</span>
                <span className={`ra-urgency-pill ${urgencyClass}`}>
                  {patient.urgencyLevel || emergency.status}
                </span>
              </div>

<<<<<<< Updated upstream
              <h4>{patient.name || 'Unknown patient'}</h4>
=======
              <h4 className="ra-card-title">{patient.name || 'Unknown Patient'}</h4>
              <p className="ra-card-desc">{patient.condition || emergency.condition}</p>
>>>>>>> Stashed changes

              <div className="ra-card-meta">
                <div className="ra-meta-location">
                  <svg className="ra-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span>{emergency.locationNode}</span>
                </div>
                <span className="ra-meta-status">{emergency.status}</span>
              </div>

              <div className="ra-card-equipment">
                <span className="ra-equipment-label">Required Equip</span>
                <span className="ra-equipment-value">{formatEquipment(emergency.requiredEquipment)}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickDispatch(emergency);
                }}
                className="ra-btn ra-btn-dispatch"
              >
                Launch Dispatch
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
