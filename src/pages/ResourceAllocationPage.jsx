import React, { useEffect, useMemo, useState } from 'react';
import EmergencyList from '../components/resource-allocation/EmergencyList.jsx';
import AmbulanceMatcher from '../components/resource-allocation/AmbulanceMatcher.jsx';
import ResourceCard from '../components/resource-allocation/ResourceCard.jsx';
import {
  fetchPendingEmergencies,
  fetchAvailableAmbulances,
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
  const [isDispatching, setIsDispatching] = useState(false);
  const [dataSource, setDataSource] = useState('checking');

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

  const matchCandidates = useMemo(() => {
    if (!selectedEmergency) {
      return [];
    }

    const required = selectedEmergency.requiredEquipment || [];

    return ambulances
      .filter((ambulance) => ambulance.status === 'AVAILABLE')
      .filter((ambulance) => required.every((equipment) => ambulance.equipment.includes(equipment)))
      .map((ambulance) => {
        const extraEquipment = Math.max(ambulance.equipment.length - required.length, 0);
        const travelMinutes = Number(ambulance.travelMinutes ?? 0);
        const score = travelMinutes + extraEquipment * 5;

        return {
          ambulance,
          required,
          travelMinutes,
          score,
          reason: `Covers every required piece of equipment (${required.join(', ')}) and adds ${extraEquipment} extra resource(s). Travel from ${ambulance.currentLocationNode} to ${selectedEmergency.locationNode} is ${travelMinutes} minutes.`
        };
      })
      .sort((left, right) => left.score - right.score);
  }, [selectedEmergency, ambulances]);

  const handleDispatch = async () => {
    if (!selectedEmergency) {
      return;
    }

    setIsDispatching(true);
    setDispatchMessage('');

    try {
      const result = await allocateAmbulance(selectedEmergency.id);
      setDispatchMessage(result);
      const dispatchedVehicleNumber = result.match(/^Ambulance (.+) dispatched successfully\.$/)?.[1];

      setEmergencies((current) => current.filter((emergency) => emergency.id !== selectedEmergency.id));
      if (dispatchedVehicleNumber) {
        setAmbulances((current) =>
          current.map((ambulance) =>
            ambulance.vehicleNumber === dispatchedVehicleNumber
              ? { ...ambulance, status: 'DISPATCHED' }
              : ambulance
          )
        );
      }

      const remaining = emergencies.filter((emergency) => emergency.id !== selectedEmergency.id);
      setSelectedId(remaining[0]?.id ?? null);
    } catch (err) {
      console.error(err);
      setDispatchMessage(err.message || 'Dispatch failed.');
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
        <ResourceCard title="Required equipment" value={selectedRequirementCount} meta={selectedEmergency ? selectedEmergency.locationNode : 'Select a case'} tone="warning" />
      </div>

      {error ? <div className="resource-alert error">{error}</div> : null}
      {dispatchMessage ? <div className="resource-alert success">{dispatchMessage}</div> : null}

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
              matches={matchCandidates}
              onDispatch={handleDispatch}
              isDispatching={isDispatching}
              summaryText={
                matchCandidates[0]
                  ? `Best fit: ${matchCandidates[0].ambulance.vehicleNumber} matches all equipment and reaches the incident in ${matchCandidates[0].travelMinutes} min.`
                  : 'No ambulance currently satisfies all required equipment.'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
