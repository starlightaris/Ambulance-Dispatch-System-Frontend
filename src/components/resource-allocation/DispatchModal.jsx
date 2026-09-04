import React from 'react';

export default function DispatchModal({ isOpen, onClose, onConfirm, emergency, ambulance, routeInfo, isDispatching }) {
  if (!isOpen || !emergency || !ambulance) return null;

  return (
    <div className="ra-modal-overlay">
      <div className="ra-modal-content">
        {/* Decorative gradient blob */}
        <div className="ra-modal-blob" />
        
        <div className="ra-modal-header relative-z10">
          <h2 className="ra-modal-title">Confirm Dispatch</h2>
          <p className="ra-modal-subtitle">You are about to assign this ambulance to the emergency.</p>
        </div>

        <div className="ra-modal-panel relative-z10">
          <h3 className="ra-modal-label">Emergency Details</h3>
          <p className="ra-modal-detail-title">{emergency.patient?.name || 'Unknown Patient'}</p>
          <p className="ra-modal-detail-desc">{emergency.condition || 'Emergency Condition'}</p>
          <div className="ra-modal-inline-box">
            <svg className="ra-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span className="ra-modal-inline-text">{emergency.locationNode}</span>
          </div>
        </div>

        <div className="ra-modal-panel relative-z10">
          <h3 className="ra-modal-label">Ambulance Assigned</h3>
          <div className="ra-modal-between mb-4">
            <div className="ra-modal-ident">
              <div className="ra-icon-box-green">
                 <svg className="ra-icon-md text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 15v1c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <span className="ra-modal-large-title">{ambulance.vehicleNumber}</span>
            </div>
            <span className="ra-status-pill ra-status-ok">
              {ambulance.status}
            </span>
          </div>
          {routeInfo && (
            <div className="ra-modal-grid">
              <div className="ra-modal-grid-col">
                <span className="ra-modal-label mb-1">Travel ETA</span>
                <span className="ra-modal-grid-val">{Math.ceil(routeInfo.totalTravelTimeMinutes || ambulance.travelMinutes || 0)} min</span>
              </div>
              <div className="ra-modal-grid-col">
                <span className="ra-modal-label mb-1">Distance</span>
                <span className="ra-modal-grid-val">{routeInfo.totalDistanceKm ? `${routeInfo.totalDistanceKm.toFixed(1)} km` : 'Unknown'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="ra-modal-actions relative-z10">
          <button
            type="button"
            onClick={onClose}
            disabled={isDispatching}
            className="ra-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDispatching}
            className="ra-btn-primary flex-center"
          >
            {isDispatching ? (
              <>
                <span className="ra-spinner"></span>
                Dispatching...
              </>
            ) : (
              'Confirm Dispatch'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
