import React, { useEffect, useMemo, useState } from 'react';
import EmergencyList from '../components/resource-allocation/EmergencyList.jsx';
import AmbulanceMatcher from '../components/resource-allocation/AmbulanceMatcher.jsx';
import ResourceCard from '../components/common/ResourceCard.jsx';
import {
  fetchPendingEmergencies,
  fetchAvailableAmbulances,
  fetchDispatchCandidates,
  allocateAmbulance
} from '../api/resourceAllocation.api.js';
import '../styles/resource-allocation.css';

export default function ResourceAllocationPage() {
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchOutcome, setDispatchOutcome] = useState(null); // 'success' | 'warning'
  const [isDispatching, setIsDispatching] = useState(false);
  const [dataSource, setDataSource] = useState('checking');
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [pendingResult, availableResult] = await Promise.all([
          fetchPendingEmergencies(),
          fetchAvailableAmbulances()
        ]);

        const pendingData = pendingResult || [];
        const availableData = availableResult || [];

        setEmergencies(pendingData);
        setAmbulances(availableData);
        setDataSource('backend');

        if (pendingData.length > 0) {
          setSelectedId((current) => current ?? pendingData[0].id);
        } else {
          setSelectedId(null);
        }
      } catch (err) {
        setEmergencies([]);
        setAmbulances([]);
        setSelectedId(null);
        setError('Resource allocation backend is unavailable. Start the backend and check its database configuration.');
        setDataSource('unavailable');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedEmergency = useMemo(() => {
    if (!emergencies.length) {
      return null;
    }

    return emergencies.find((emergency) => emergency.id === selectedId) || emergencies[0];
  }, [emergencies, selectedId]);

  // The ranking itself - order, travel time, equipment penalty, score - comes
  // straight from GET /{id}/candidates (GreedyScheduler's real computation).
  // Nothing is re-scored or re-sorted here.
  useEffect(() => {
    if (!selectedEmergency) {
      setCandidates([]);
      return;
    }

    let cancelled = false;
    setCandidatesLoading(true);
    setCandidatesError('');

    fetchDispatchCandidates(selectedEmergency.id)
      .then((result) => {
        if (!cancelled) {
          setCandidates(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCandidates([]);
          setCandidatesError(err.message || 'Could not load candidate ambulances.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCandidatesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedEmergency]);

  // Fills in display-only details (location/status/equipment) for each ranked
  // candidate from the already-fetched fleet list, by id - purely cosmetic,
  // doesn't touch the ranking or the scores themselves.
  const matches = useMemo(() => {
    if (!selectedEmergency) {
      return [];
    }

    return candidates.map((candidate) => {
      const ambulance = ambulances.find((amb) => amb.id === candidate.ambulanceId);

      return {
        ...candidate,
        currentLocationNode: ambulance?.currentLocationNode ?? 'Unknown node',
        status: ambulance?.status ?? 'AVAILABLE',
        equipment: ambulance?.equipment ?? []
      };
    });
  }, [candidates, ambulances, selectedEmergency]);

  const handleDispatch = async () => {
    if (!selectedEmergency) {
      return;
    }

    setIsDispatching(true);
    setDispatchMessage('');
    setDispatchOutcome(null);

    try {
      const result = await allocateAmbulance(selectedEmergency.id);
      setDispatchMessage(result.message);
      setDispatchOutcome(result.dispatched ? 'success' : 'warning');

      if (result.dispatched) {
        setEmergencies((current) => current.filter((emergency) => emergency.id !== selectedEmergency.id));

        if (result.ambulanceVehicleNumber) {
          setAmbulances((current) =>
            current.map((ambulance) =>
              ambulance.vehicleNumber === result.ambulanceVehicleNumber
                ? { ...ambulance, status: 'DISPATCHED' }
                : ambulance
            )
          );
        }

        const remaining = emergencies.filter((emergency) => emergency.id !== selectedEmergency.id);
        setSelectedId(remaining[0]?.id ?? null);
      }
      // When nothing was dispatched, the call stays in the queue and the fleet
      // is left untouched - a "no ambulance available" result is not a success.
    } catch (err) {
      console.error(err);
      setDispatchMessage(err.message || 'Dispatch failed.');
      setDispatchOutcome('warning');
    } finally {
      setIsDispatching(false);
    }
  };

  const availableAmbulances = ambulances.filter((ambulance) => ambulance.status === 'AVAILABLE').length;
  const selectedRequirementCount = selectedEmergency?.requiredEquipment?.length ?? 0;

  return (
    <div className="page-placeholder resource-allocation-page">
      <div className="resource-allocation-header">
        <div>
          <p className="eyebrow">Intelligent Resource Allocation</p>
          <h1>Emergency dispatch matching</h1>
        </div>
        <div className="resource-header-status">
          <span className={`status-chip ${dataSource === 'backend' ? 'live' : 'demo'}`}>
            {dataSource === 'backend' ? 'Live backend' : dataSource === 'demo' ? 'Demo fallback' : dataSource === 'unavailable' ? 'Backend unavailable' : 'Checking backend'}
          </span>
        </div>
      </div>

      <div className="resource-stat-grid">
        <ResourceCard title="Active emergencies" value={emergencies.length} meta="Queued calls" tone="info" />
        <ResourceCard title="Available ambulances" value={availableAmbulances} meta="Ready to dispatch" tone="ok" />
        <ResourceCard title="Required equipment" value={selectedRequirementCount} meta={selectedEmergency ? selectedEmergency.locationNode : 'Select an emergency'} tone="warning" />
      </div>

      {error ? <div className="resource-alert error">{error}</div> : null}
      {dispatchMessage ? (
        <div className={`resource-alert ${dispatchOutcome === 'success' ? 'success' : 'warning'}`}>
          {dispatchMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="resource-panel loading-panel">
          <h3>Loading allocation queue…</h3>
        </div>
      ) : (
        <div className="resource-layout">
          <div className="resource-column">
            <EmergencyList
              emergencies={emergencies}
              selectedId={selectedEmergency?.id ?? null}
              onSelect={setSelectedId}
            />
          </div>

          <div className="resource-column resource-column-main">
            <AmbulanceMatcher
              emergency={selectedEmergency}
              matches={matches}
              isLoading={candidatesLoading}
              error={candidatesError}
              onDispatch={handleDispatch}
              isDispatching={isDispatching}
              summaryText={
                matches[0]
                  ? `Best fit: ${matches[0].vehicleNumber} matches all equipment and reaches the emergency in ${matches[0].travelMinutes.toFixed(1)} min (computed by the backend's greedy scheduler).`
                  : 'No ambulance currently satisfies all required equipment.'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
