import React, { useEffect, useMemo, useState } from 'react';
import EmergencyList from '../components/resource-allocation/EmergencyList.jsx';
import AmbulanceMatcher from '../components/resource-allocation/AmbulanceMatcher.jsx';
import ResourceCard from '../components/resource-allocation/ResourceCard.jsx';
import MapPanel from '../components/resource-allocation/MapPanel.jsx';
import DispatchModal from '../components/resource-allocation/DispatchModal.jsx';
import {
  fetchPendingEmergencies,
  fetchAvailableAmbulances,
  fetchDispatchCandidates,
  allocateAmbulance,
  fetchTriageQueue,
  calculateRoute
} from '../api/resourceAllocation.api.js';
import '../styles/resource-allocation.css';

export default function ResourceAllocationPage() {
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Dispatch Modal & Routing State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchingEmergency, setDispatchingEmergency] = useState(null);
  const [dispatchingAmbulance, setDispatchingAmbulance] = useState(null);
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
        const [pendingResult, availableResult, triageResult] = await Promise.all([
          fetchPendingEmergencies(),
          fetchAvailableAmbulances(),
          fetchTriageQueue()
        ]);

        const pendingData = pendingResult || [];
        const availableData = availableResult || [];
        const triageData = triageResult || [];

        // Enrich emergencies with triage severity
        const enrichedEmergencies = pendingData.map((em) => {
          const triageMatch = triageData.find((t) => String(t.callId) === String(em.id));
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
  }, []);

  const selectedEmergency = useMemo(() => {
    if (!emergencies.length) return null;
    return emergencies.find((emergency) => emergency.id === selectedId) || emergencies[0];
  }, [emergencies, selectedId]);

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

  const handleQuickDispatch = async (emergency) => {
    const targetEmergency = emergency || selectedEmergency;
    if (!targetEmergency) return;

    let targetAmbulance = null;
    if (matches.length > 0) {
      targetAmbulance = ambulances.find((amb) => amb.id === matches[0].ambulanceId);
    }
    if (!targetAmbulance) {
      targetAmbulance = ambulances.find((amb) => amb.status === 'AVAILABLE');
    }

    if (!targetAmbulance) {
      setError('No available ambulance to dispatch for this call.');
      return;
    }

    setDispatchingEmergency(targetEmergency);
    setDispatchingAmbulance(targetAmbulance);
    setIsDispatchModalOpen(true);

    if (targetAmbulance.currentLocationNode && targetEmergency.locationNode) {
      const route = await calculateRoute(targetAmbulance.currentLocationNode, targetEmergency.locationNode);
      setRouteInfo(route);
    } else {
      setRouteInfo(null);
    }
  };

  const confirmDispatch = async () => {
    if (!dispatchingEmergency || !dispatchingAmbulance) return;

    setIsDispatching(true);
    setDispatchMessage('');
    setError('');

    try {
      const result = await allocateAmbulance(dispatchingEmergency.id);
      setDispatchMessage(result.message || `Successfully dispatched ${dispatchingAmbulance.vehicleNumber}`);

      if (result.dispatched) {
        setEmergencies((current) => current.filter((em) => em.id !== dispatchingEmergency.id));
        setAmbulances((current) =>
          current.map((amb) =>
            amb.id === dispatchingAmbulance.id || amb.vehicleNumber === result.ambulanceVehicleNumber
              ? { ...amb, status: 'DISPATCHED' }
              : amb
          )
        );

        const remaining = emergencies.filter((em) => em.id !== dispatchingEmergency.id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
        setIsDispatchModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Dispatch failed.');
    } finally {
      setIsDispatching(false);
    }
  };

  const closeDispatchModal = () => {
    if (!isDispatching) {
      setIsDispatchModalOpen(false);
      setDispatchingEmergency(null);
      setDispatchingAmbulance(null);
      setRouteInfo(null);
    }
  };

  const availableAmbulances = ambulances.filter((a) => a.status === 'AVAILABLE').length;
  const criticalCalls = emergencies.filter((e) => String(e.patient?.urgencyLevel).toLowerCase().includes('critical')).length;

  const mapPolyline = useMemo(() => {
    if (routeInfo && routeInfo.route) {
      return routeInfo.route.map((node) => [node.latitude, node.longitude]);
    }
    return null;
  }, [routeInfo]);

  return (
    <div className="ra-page-container">
      {/* Header */}
      <div className="ra-header">
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
          </div>
        </div>

        <div className="ra-stats-grid relative-z10">
          <ResourceCard title="Pending Calls" value={emergencies.length} meta="Waiting for allocation" tone={emergencies.length > 0 ? 'warning' : 'ok'} />
          <ResourceCard title="Available Units" value={availableAmbulances} meta="Ready to dispatch" tone={availableAmbulances > 0 ? 'ok' : 'danger'} />
          <ResourceCard title="Active Dispatches" value={ambulances.filter((a) => a.status === 'DISPATCHED' || a.status === 'EN_ROUTE').length} meta="Units en route" tone="info" />
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

            {/* Right Panel: Resource Fleet Status & Matching */}
            <div className="ra-col">
              <AmbulanceMatcher
                ambulances={ambulances}
                emergency={selectedEmergency}
                matches={matches}
                isLoading={candidatesLoading}
                error={candidatesError}
              />
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
