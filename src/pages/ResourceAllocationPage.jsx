import React, { useState } from 'react';
import ResourceCard from '../components/resource-allocation/ResourceCard.jsx';
import { dispatchCall } from '../api/resourceAllocation.api.js';
import '../styles/resource-allocation.css';

export default function ResourceAllocationPage() {
  const [callId, setCallId] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [error, setError] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');

  async function handleDispatch(event) {
    event.preventDefault();
    setError('');
    setDispatchMessage('');
    setIsDispatching(true);

    try {
      const result = await dispatchCall(callId);
      setDispatchMessage(
        typeof result === 'string' ? result : 'The emergency call was dispatched successfully.'
      );
    } catch (requestError) {
      setError(requestError.message || 'Dispatch failed.');
    } finally {
      setIsDispatching(false);
    }
  }

  return (
    <main className="page-placeholder resource-allocation-page">
      <header className="resource-allocation-header">
        <div>
          <p className="eyebrow">Intelligent Resource Allocation</p>
          <h1>Emergency dispatch</h1>
        </div>
        <div className="resource-header-status">
          <span className="status-chip live">Live backend</span>
        </div>
      </header>

      <div className="resource-stat-grid">
        <ResourceCard title="Dispatch input" value="Call ID" meta="Existing emergency call" tone="info" />
        <ResourceCard title="Ambulance selection" value="Server" meta="Equipment and route fitness" tone="ok" />
        <ResourceCard title="API operation" value="POST" meta="Versioned /api/v1 endpoint" tone="warning" />
      </div>

      {error ? <div className="resource-alert error" role="alert">{error}</div> : null}
      {dispatchMessage ? (
        <div className="resource-alert success" role="status">{dispatchMessage}</div>
      ) : null}

      <section className="resource-panel dispatch-panel">
        <div className="panel-heading">
          <div>
            <h2>Dispatch an emergency call</h2>
            <p>
              Enter an existing call ID. The backend checks the call, evaluates available
              ambulances, and assigns the best eligible vehicle.
            </p>
          </div>
        </div>

        <form className="dispatch-form" onSubmit={handleDispatch}>
          <label htmlFor="dispatch-call-id">Emergency call ID</label>
          <div className="dispatch-form-row">
            <input
              id="dispatch-call-id"
              name="callId"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={callId}
              onChange={(event) => setCallId(event.target.value)}
              placeholder="e.g. 1"
              required
            />
            <button className="dispatch-button" type="submit" disabled={isDispatching}>
              {isDispatching ? 'Dispatching...' : 'Dispatch best ambulance'}
            </button>
          </div>
        </form>

        <div className="dispatch-explanation">
          <h3>How selection works</h3>
          <p>
            Selection is performed by the backend scheduler using the call location, required
            medical equipment, ambulance availability, and route cost. The success message names
            the vehicle that was actually assigned.
          </p>
        </div>
      </section>
    </main>
  );
}
