const normalizeEquipment = (equipment) => {
  if (!Array.isArray(equipment)) {
    return [];
  }

  return equipment
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);
};

// Field names below mirror CallDto / AmbulanceDto / CandidateDto exactly
// (src/main/java/.../resource_allocation/dto on the backend) - no guessed
// alternate field names, since there's only one real shape to expect now.
const normalizeEmergency = (call) => ({
  id: call.id,
  patient: {
    name: call.patientName ?? 'Unknown patient',
    urgencyLevel: call.urgencyLevel ?? null
  },
  locationNode: call.locationNode ?? 'Node_Unknown',
  status: call.status ?? 'RECEIVED',
  requiredEquipment: normalizeEquipment(call.requiredEquipment),
  receivedAt: call.receivedAt ?? null,
  assignedAmbulanceVehicleNumber: call.assignedAmbulanceVehicleNumber ?? null
});

const normalizeAmbulance = (ambulance) => ({
  id: ambulance.id,
  vehicleNumber: ambulance.vehicleNumber ?? 'AMB-XXX',
  currentLocationNode: ambulance.currentLocationNode ?? 'Unknown node',
  status: ambulance.status ?? 'AVAILABLE',
  equipment: normalizeEquipment(ambulance.equipment)
});

// CandidateDto - the greedy scheduler's actual ranking for one call, computed
// server-side from the real road-graph shortest path. Nothing here is guessed.
const normalizeCandidate = (candidate) => ({
  ambulanceId: candidate.ambulanceId,
  vehicleNumber: candidate.vehicleNumber,
  travelMinutes: Number(candidate.travelMinutes ?? 0),
  extraEquipmentCount: Number(candidate.extraEquipmentCount ?? 0),
  score: Number(candidate.score ?? 0)
});

async function safeFetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} -> HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchPendingEmergencies() {
  const payload = await safeFetchJson('/api/v1/calls/pending');
  const list = Array.isArray(payload) ? payload : [payload].filter(Boolean);

  return list.map(normalizeEmergency);
}

export async function fetchAvailableAmbulances() {
  const payload = await safeFetchJson('/api/v1/calls/ambulances');
  const list = Array.isArray(payload) ? payload : [payload].filter(Boolean);

  return list
    .map(normalizeAmbulance)
    .filter((ambulance) => ambulance.status === 'AVAILABLE');
}

/**
 * Read-only preview of GreedyScheduler's ranking for a call - GET /{id}/candidates.
 * Dispatches nothing; safe to call whenever the selected emergency changes.
 */
export async function fetchDispatchCandidates(callId) {
  const payload = await safeFetchJson(`/api/v1/calls/${callId}/candidates`);
  const list = Array.isArray(payload) ? payload : [];

  return list.map(normalizeCandidate);
}

/**
 * POST /{id}/dispatch. The backend now replies with a DispatchResultDto
 * ({ dispatched, callId, ambulanceVehicleNumber, message }), not plain text -
 * callers must check `dispatched` themselves; a 200 response does not mean an
 * ambulance was actually assigned (it may just mean none was available).
 */
export async function allocateAmbulance(callId) {
  const url = `/api/v1/calls/${callId}/dispatch`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `HTTP ${response.status}`);
  }

<<<<<<< Updated upstream
  return {
    dispatched: Boolean(payload?.dispatched),
    callId: payload?.callId ?? callId,
    ambulanceVehicleNumber: payload?.ambulanceVehicleNumber ?? null,
    message: payload?.message
      ?? (payload?.dispatched ? 'Dispatch completed.' : 'No suitable ambulance available at this time.')
  };
}
=======
  return text || 'Dispatch completed';
}

// Added endpoints for Dashboard context
export async function fetchTriageQueue() {
  try {
    const payload = await safeFetchJson('/api/v1/triage/assessments/queue');
    return Array.isArray(payload) ? payload : [];
  } catch (err) {
    return [];
  }
}

export async function calculateRoute(origin, destination) {
  try {
    const response = await fetch('/api/v1/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ origin, destination })
    });
    
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    return null;
  }
}
>>>>>>> Stashed changes
