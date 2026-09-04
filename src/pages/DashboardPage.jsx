import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { fetchAmbulances, fetchBlindSpots } from '../api/networkDetection.api.js';
import { fetchPendingEmergencies } from '../api/resourceAllocation.api.js';
import { fetchActiveQueue } from '../api/triage.api.js';
import ResourceCard from '../components/common/ResourceCard.jsx';
import { categoryDetails, categoryNames } from '../components/triage/categoryDetails.js';
import { formatLabel } from '../utils/formatLabel.js';
import '../styles/dashboard.css';

// Same default response-time threshold Network Detection opens with — good
// enough for an at-a-glance count here; the full control lives on that page.
const BLIND_SPOT_THRESHOLD_MINUTES = 10;

const MODULE_GROUPS = [
  {
    label: 'Live dispatch',
    links: [
      { to: '/network-detection', label: 'Network Detection', description: 'Live fleet coverage, blind spots and the road map.' },
      { to: '/routing', label: 'Routing', description: 'Shortest path between any two points on the network.' },
      { to: '/triage', label: 'Triage', description: 'Assess a patient and see the live priority queue.' },
    ],
  },
  {
    label: 'Command & planning',
    links: [
      { to: '/resource-allocation', label: 'Resource Allocation', description: 'Match pending emergencies to the best available ambulance.' },
      { to: '/scheduling', label: 'Scheduling', description: "Build the week's roster and shift template." },
    ],
  },
];

// The triage queue arrives from the backend already ordered (max-heap:
// category severity, then priority score, then arrival) — the worst
// category present is whichever named category shows up first here.
function worstTriageCategory(queue) {
  return categoryNames.find((name) => queue.some((assessment) => assessment.category === name)) ?? null;
}

export default function DashboardPage() {
  const [ambulances, setAmbulances] = useState([]);
  const [ambulancesError, setAmbulancesError] = useState('');
  const [blindSpotCount, setBlindSpotCount] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [emergenciesError, setEmergenciesError] = useState('');
  const [triageQueue, setTriageQueue] = useState([]);
  const [triageError, setTriageError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Each card's data comes from a different module's backend, so one
    // module being down shouldn't blank out the other three — allSettled
    // instead of Promise.all, with each result handled independently.
    Promise.allSettled([
      fetchAmbulances(),
      fetchBlindSpots(BLIND_SPOT_THRESHOLD_MINUTES),
      fetchPendingEmergencies(),
      fetchActiveQueue(),
    ]).then(([ambulancesResult, blindSpotsResult, emergenciesResult, triageResult]) => {
      if (cancelled) return;

      if (ambulancesResult.status === 'fulfilled') {
        setAmbulances(ambulancesResult.value);
      } else {
        setAmbulancesError('Fleet data unavailable.');
      }

      if (blindSpotsResult.status === 'fulfilled') {
        setBlindSpotCount(blindSpotsResult.value.length);
      }

      if (emergenciesResult.status === 'fulfilled') {
        setEmergencies(emergenciesResult.value);
      } else {
        setEmergenciesError('Resource allocation backend unavailable.');
      }

      if (triageResult.status === 'fulfilled') {
        setTriageQueue(triageResult.value);
      } else {
        setTriageError('Triage backend unavailable.');
      }

      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const availableAmbulances = ambulances.filter((a) => a.status === 'AVAILABLE').length;
  const worstCategory = worstTriageCategory(triageQueue);
  const oldestEmergency = emergencies[0] ?? null;
  const nextInTriage = triageQueue[0] ?? null;

  return (
    <div className="page-placeholder dashboard-page">
      <div className="dashboard-header">
        <p className="eyebrow">Live dispatch · overview</p>
        <h1>Dispatch overview</h1>
        <p className="dashboard-subtitle">Fleet, coverage, emergencies and the triage queue at a glance.</p>
      </div>

      <div className="resource-stat-grid dashboard-stat-grid">
        <ResourceCard
          title="Active emergencies"
          value={loading ? '…' : emergenciesError ? '—' : emergencies.length}
          meta={emergenciesError || 'Queued for allocation'}
          tone={!emergenciesError && emergencies.length > 0 ? 'warning' : 'ok'}
        />
        <ResourceCard
          title="Available ambulances"
          value={loading ? '…' : ambulancesError ? '—' : availableAmbulances}
          meta={ambulancesError || `${ambulances.length} in the fleet`}
          tone="info"
        />
        <ResourceCard
          title="Blind spots"
          value={loading ? '…' : blindSpotCount ?? '—'}
          meta={blindSpotCount === null ? 'Coverage data unavailable' : `Beyond ${BLIND_SPOT_THRESHOLD_MINUTES} min response`}
          tone={blindSpotCount ? 'danger' : 'ok'}
        />
        <ResourceCard
          title="Triage queue"
          value={loading ? '…' : triageError ? '—' : triageQueue.length}
          meta={triageError || (worstCategory ? `Worst waiting: ${categoryDetails[worstCategory].label}` : 'Nobody waiting')}
          tone={worstCategory === 'RED' || worstCategory === 'ORANGE' ? 'danger' : 'ok'}
        />
      </div>

      <div className="dashboard-attention">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <h2>Oldest pending emergency</h2>
            <NavLink to="/resource-allocation" className="dashboard-panel-link">Open Resource Allocation →</NavLink>
          </div>
          {emergenciesError ? (
            <p className="empty-note">{emergenciesError}</p>
          ) : oldestEmergency ? (
            <div className="dashboard-attention-row">
              <div>
                <strong>{oldestEmergency.patient.name || 'Unknown patient'}</strong>
                <span className="dashboard-attention-meta">
                  {formatLabel(oldestEmergency.patient.urgencyLevel || oldestEmergency.status)} · {oldestEmergency.locationNode}
                </span>
              </div>
            </div>
          ) : (
            <p className="empty-note">No emergencies queued.</p>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <h2>Next in triage queue</h2>
            <NavLink to="/triage" className="dashboard-panel-link">Open Triage →</NavLink>
          </div>
          {triageError ? (
            <p className="empty-note">{triageError}</p>
          ) : nextInTriage ? (
            <div className="dashboard-attention-row">
              <span
                className="dashboard-category-dot"
                style={{ backgroundColor: categoryDetails[nextInTriage.category]?.color ?? 'var(--accent-info)' }}
              />
              <div>
                <strong>{categoryDetails[nextInTriage.category]?.label ?? nextInTriage.category}</strong>
                <span className="dashboard-attention-meta">
                  Score {Number(nextInTriage.score).toFixed(1)} · queue position #{nextInTriage.queuePosition}
                </span>
              </div>
            </div>
          ) : (
            <p className="empty-note">No patients waiting.</p>
          )}
        </div>
      </div>

      <div className="dashboard-modules">
        {MODULE_GROUPS.map((group) => (
          <div className="dashboard-module-group" key={group.label}>
            <span className="dashboard-module-group-label">{group.label}</span>
            <div className="dashboard-module-cards">
              {group.links.map((link) => (
                <NavLink to={link.to} className="dashboard-module-card" key={link.to}>
                  <strong>{link.label}</strong>
                  <span>{link.description}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
