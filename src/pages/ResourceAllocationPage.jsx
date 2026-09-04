import React, { useEffect, useMemo, useState, useCallback } from 'react';
import EmergencyList from '../components/resource-allocation/EmergencyList.jsx';
import AmbulanceMatcher from '../components/resource-allocation/AmbulanceMatcher.jsx';
import ResourceCard from '../components/resource-allocation/ResourceCard.jsx';
import MapPanel from '../components/resource-allocation/MapPanel.jsx';
import DispatchModal from '../components/resource-allocation/DispatchModal.jsx';
import {
  fetchPendingEmergencies,
  fetchAvailableAmbulances,
<<<<<<< Updated upstream
  fetchDispatchCandidates,
  allocateAmbulance
=======
  allocateAmbulance,
  fetchTriageQueue,
  calculateRoute
>>>>>>> Stashed changes
} from '../api/resourceAllocation.api.js';
import '../styles/resource-allocation.css';

export default function ResourceAllocationPage() {
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
<<<<<<< Updated upstream
  const [dispatchOutcome, setDispatchOutcome] = useState(null); // 'success' | 'warning'
=======

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchingEmergency, setDispatchingEmergency] = useState(null);
  const [dispatchingAmbulance, setDispatchingAmbulance] = useState(null);
>>>>>>> Stashed changes
  const [isDispatching, setIsDispatching] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const [dataSource, setDataSource] = useState('checking');
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
<<<<<<< Updated upstream
        const [pendingResult, availableResult] = await Promise.all([
=======
        const [pendingResult, availableResult, triageResult] = await Promise.all([
>>>>>>> Stashed changes
          fetchPendingEmergencies(),
          fetchAvailableAmbulances(),
          fetchTriageQueue()
        ]);

        const pendingData = pendingResult || [];
        const availableData = availableResult || [];
        const triageData = triageResult || [];

        // Enrich emergencies with triage severity
        const enrichedEmergencies = pendingData.map(em => {
          const triageMatch = triageData.find(t => String(t.callId) === String(em.id));
          if (triageMatch) {
            return {
              ...em,
              patient: {
                ...em.patient,
                urgencyLevel: triageMatch.severityLevel || triageMatch.priority || em.patient?.urgencyLevel
              }
            };
          }
          return em;
        });

        setEmergencies(enrichedEmergencies);
        setAmbulances(availableData);
        setDataSource('backend');

        if (enrichedEmergencies.length > 0) {
          setSelectedId((current) => current ?? enrichedEmergencies[0].id);
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
    // Optional: Add polling here with setInterval
  }, []);

  const selectedEmergency = useMemo(() => {
    if (!emergencies.length) return null;
    return emergencies.find((emergency) => emergency.id === selectedId) || emergencies[0];
  }, [emergencies, selectedId]);

<<<<<<< Updated upstream
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
=======
  const handleQuickDispatch = useCallback(async (emergency) => {
    if (!emergency) return;

    // Find the best available ambulance based on equipment match and travel time
    const required = emergency.requiredEquipment || [];
    const matchCandidates = ambulances
      .filter((amb) => amb.status === 'AVAILABLE')
      .filter((amb) => required.every((eq) => amb.equipment.includes(eq)))
      .map((amb) => ({
        ambulance: amb,
        score: Number(amb.travelMinutes || 0) + Math.max(amb.equipment.length - required.length, 0) * 5
      }))
      .sort((a, b) => a.score - b.score);

    if (matchCandidates.length > 0) {
      const bestAmbulance = matchCandidates[0].ambulance;
      setDispatchingEmergency(emergency);
      setDispatchingAmbulance(bestAmbulance);
      setRouteInfo(null);
      setIsDispatchModalOpen(true);

      // Calculate real route asynchronously
      if (emergency.latitude && emergency.longitude && bestAmbulance.latitude && bestAmbulance.longitude) {
        try {
          const route = await calculateRoute(
            { lat: bestAmbulance.latitude, lng: bestAmbulance.longitude },
            { lat: emergency.latitude, lng: emergency.longitude }
          );
          if (route) setRouteInfo(route);
        } catch (e) {
          console.error("Failed to calculate route", e);
        }
      }
    } else {
      setError(`No ambulance available for ${emergency.id} matching required equipment.`);
      setTimeout(() => setError(''), 5000);
>>>>>>> Stashed changes
    }
  }, [ambulances]);

<<<<<<< Updated upstream
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
=======
  const confirmDispatch = async () => {
    if (!dispatchingEmergency || !dispatchingAmbulance) return;

    setIsDispatching(true);
    setDispatchMessage('');
    setError('');

    try {
      const result = await allocateAmbulance(dispatchingEmergency.id);
      setDispatchMessage(`Successfully dispatched ${dispatchingAmbulance.vehicleNumber}`);

      setEmergencies((current) => current.filter((em) => em.id !== dispatchingEmergency.id));
      setAmbulances((current) =>
        current.map((amb) =>
          amb.id === dispatchingAmbulance.id
            ? { ...amb, status: 'DISPATCHED' }
            : amb
        )
      );

      const remaining = emergencies.filter((em) => em.id !== dispatchingEmergency.id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      setIsDispatchModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Dispatch failed.');
>>>>>>> Stashed changes
    } finally {
      setIsDispatching(false);
    }
  };

  const closeDispatchModal = () => {
    if (!isDispatching) {
      setIsDispatchModalOpen(false);
      setDispatchingEmergency(null);
      setDispatchingAmbulance(null);
    }
  };

  const availableAmbulances = ambulances.filter((a) => a.status === 'AVAILABLE').length;
  const criticalCalls = emergencies.filter((e) => String(e.patient?.urgencyLevel).toLowerCase().includes('critical')).length;

  // Format route polyline for MapPanel
  const mapPolyline = useMemo(() => {
    if (routeInfo && routeInfo.route) {
      return routeInfo.route.map(node => [node.latitude, node.longitude]);
    }
    return null;
  }, [routeInfo]);

  return (
<<<<<<< Updated upstream
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
        <ResourceCard title="Required equipment" value={selectedRequirementCount} meta={selectedEmergency ? selectedEmergency.locationNode : 'Select a case'} tone="warning" />
      </div>

      {error ? <div className="resource-alert error">{error}</div> : null}
      {dispatchMessage ? (
        <div className={`resource-alert ${dispatchOutcome === 'success' ? 'success' : 'warning'}`}>
          {dispatchMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="resource-panel loading-panel">
          <h3>Loading allocation queue...</h3>
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
                  ? `Best fit: ${matches[0].vehicleNumber} matches all equipment and reaches the incident in ${matches[0].travelMinutes.toFixed(1)} min (computed by the backend's greedy scheduler).`
                  : 'No ambulance currently satisfies all required equipment.'
              }
            />
=======
    <div className="ra-page-container">
      
      {/* Header */}
      <div className="ra-header">
        {/* Subtle decorative gradient */}
        <div className="ra-header-blob" />
        
        <div className="ra-header-top">
          <div>
            <p className="ra-header-eyebrow">Intelligent Resource Allocation</p>
            <h1 className="ra-header-title">Dispatcher Dashboard</h1>
          </div>
          <div className="ra-header-status-box">
            <span className={`ra-status-chip ${
              dataSource === 'backend' ? 'ra-chip-live' :
              dataSource === 'unavailable' ? 'ra-chip-offline' :
              'ra-chip-connecting'
            }`}>
              <span className={`ra-status-dot ${dataSource === 'backend' ? 'ra-dot-live' : dataSource === 'unavailable' ? 'ra-dot-offline' : 'ra-dot-connecting'}`}></span>
              {dataSource === 'backend' ? 'System Live' : dataSource === 'unavailable' ? 'Offline' : 'Connecting...'}
            </span>
>>>>>>> Stashed changes
          </div>
        </div>

        <div className="ra-stats-grid relative-z10">
          <ResourceCard title="Pending Calls" value={emergencies.length} meta="Waiting for allocation" tone={emergencies.length > 0 ? 'warning' : 'ok'} />
          <ResourceCard title="Available Units" value={availableAmbulances} meta="Ready to dispatch" tone={availableAmbulances > 0 ? 'ok' : 'danger'} />
          <ResourceCard title="Active Dispatches" value={ambulances.filter(a => a.status === 'DISPATCHED' || a.status === 'EN_ROUTE').length} meta="Units en route" tone="info" />
          <ResourceCard title="Critical Cases" value={criticalCalls} meta="Highest priority triage" tone={criticalCalls > 0 ? 'danger' : 'default'} />
        </div>
        
        {error && (
          <div className="ra-alert ra-alert-error">
            <svg className="ra-icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        {dispatchMessage && (
          <div className="ra-alert ra-alert-success">
            <svg className="ra-icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {dispatchMessage}
          </div>
        )}
      </div>

      {/* Main Content Area: 3-column Layout */}
      <div className="ra-main-area">
        {loading ? (
          <div className="ra-loading-container">
            <div className="ra-spinner-large"></div>
          </div>
        ) : (
          <div className="ra-main-grid">
            {/* Left Panel: Emergency Calls Queue */}
            <div className="ra-col">
              <EmergencyList
                emergencies={emergencies}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onQuickDispatch={handleQuickDispatch}
              />
            </div>

            {/* Center Panel: Map View */}
            <div className="ra-col-large ra-map-panel">
              <MapPanel
                emergencies={emergencies}
                ambulances={ambulances}
                selectedEmergencyId={selectedId}
                routePolyline={mapPolyline}
              />
            </div>

            {/* Right Panel: Resource Fleet Status */}
            <div className="ra-col">
              <AmbulanceMatcher ambulances={ambulances} />
            </div>
          </div>
        )}
      </div>

      {/* Dispatch Modal Overlay */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={closeDispatchModal}
        onConfirm={confirmDispatch}
        emergency={dispatchingEmergency}
        ambulance={dispatchingAmbulance}
        routeInfo={routeInfo}
        isDispatching={isDispatching}
      />
    </div>
  );
}
