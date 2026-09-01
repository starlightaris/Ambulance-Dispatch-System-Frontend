const DEMO_EMERGENCIES = [
  {
    id: 101,
    patient: {
      name: 'Maya Silva',
      condition: 'Chest pain and shortness of breath',
      urgencyLevel: 'HIGH'
    },
    locationNode: 'Node_16',
    status: 'RECEIVED',
    requiredEquipment: ['ECG_MONITOR', 'DEFIBRILLATOR', 'OXYGEN_SUPPLY'],
    receivedAt: '2026-09-01T08:05:00'
  },
  {
    id: 102,
    patient: {
      name: 'Daniel Green',
      condition: 'Severe respiratory distress',
      urgencyLevel: 'CRITICAL'
    },
    locationNode: 'Node_09',
    status: 'RECEIVED',
    requiredEquipment: ['VENTILATOR', 'OXYGEN_SUPPLY', 'ICU_EQUIPMENT'],
    receivedAt: '2026-09-01T08:12:00'
  },
  {
    id: 103,
    patient: {
      name: 'Aisha Khan',
      condition: 'Post-accident trauma',
      urgencyLevel: 'MEDIUM'
    },
    locationNode: 'Node_21',
    status: 'RECEIVED',
    requiredEquipment: ['ECG_MONITOR', 'DEFIBRILLATOR'],
    receivedAt: '2026-09-01T08:18:00'
  }
];

const DEMO_AMBULANCES = [
  {
    id: 1,
    vehicleNumber: 'AMB-104',
    currentLocationNode: 'Node_12',
    status: 'AVAILABLE',
    equipment: ['ECG_MONITOR', 'DEFIBRILLATOR', 'OXYGEN_SUPPLY'],
    travelMinutes: 11
  },
  {
    id: 2,
    vehicleNumber: 'AMB-217',
    currentLocationNode: 'Node_05',
    status: 'AVAILABLE',
    equipment: ['VENTILATOR', 'ICU_EQUIPMENT', 'OXYGEN_SUPPLY'],
    travelMinutes: 16
  },
  {
    id: 3,
    vehicleNumber: 'AMB-305',
    currentLocationNode: 'Node_19',
    status: 'AVAILABLE',
    equipment: ['ECG_MONITOR', 'DEFIBRILLATOR', 'VENTILATOR'],
    travelMinutes: 8
  },
  {
    id: 4,
    vehicleNumber: 'AMB-418',
    currentLocationNode: 'Node_22',
    status: 'DISPATCHED',
    equipment: ['ECG_MONITOR', 'DEFIBRILLATOR', 'OXYGEN_SUPPLY'],
    travelMinutes: 6
  }
];

const normalizeEquipment = (equipment) => {
  if (!Array.isArray(equipment)) {
    return [];
  }

  return equipment
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);
};

const inferEquipmentFromCategory = (category) => {
  const normalized = String(category || '').toUpperCase();

  if (normalized.includes('RED') || normalized.includes('CRITICAL')) {
    return ['DEFIBRILLATOR', 'OXYGEN_SUPPLY', 'ICU_EQUIPMENT'];
  }

  if (normalized.includes('YELLOW') || normalized.includes('HIGH')) {
    return ['ECG_MONITOR', 'OXYGEN_SUPPLY'];
  }

  return ['ECG_MONITOR'];
};

const normalizeEmergency = (call) => ({
  id: call.id ?? call.callId ?? call.uuid ?? Date.now(),
  patient: call.patient ?? {
    name: call.patientName ?? 'Unknown patient',
    condition: call.condition ?? 'Emergency condition',
    urgencyLevel: call.urgencyLevel ?? call.category ?? 'HIGH'
  },
  condition: call.condition ?? call.patient?.condition ?? 'Emergency condition',
  locationNode: call.locationNode ?? call.location ?? 'Node_Unknown',
  status: call.status ?? 'RECEIVED',
  requiredEquipment: normalizeEquipment(
    call.requiredEquipment ?? call.patient?.requiredEquipment ?? inferEquipmentFromCategory(call.category ?? call.urgencyLevel)
  ),
  receivedAt: call.receivedAt ?? new Date().toISOString()
});

const normalizeAmbulance = (ambulance) => ({
  id: ambulance.id ?? ambulance.ambulanceId,
  vehicleNumber: ambulance.vehicleNumber ?? ambulance.registrationNumber ?? 'AMB-XXX',
  currentLocationNode: ambulance.currentLocationNode ?? ambulance.locationNode ?? 'Unknown node',
  status: ambulance.status ?? 'AVAILABLE',
  equipment: normalizeEquipment(ambulance.equipment ?? []),
  travelMinutes: Number(ambulance.travelMinutes ?? ambulance.distanceMinutes ?? ambulance.score ?? 0)
});

async function safeFetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} -> HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchPendingEmergencies() {
  const candidateUrls = ['/api/dispatch/pending', '/api/dispatch/queue', '/api/v1/triage/queue'];

  for (const url of candidateUrls) {
    try {
      const payload = await safeFetchJson(url);
      const list = Array.isArray(payload) ? payload : [payload];
      if (list.length > 0) {
        return { items: list.map(normalizeEmergency), source: 'backend' };
      }
    } catch (error) {
      // Ignore missing endpoints and use the demo fallback below.
    }
  }

  return { items: DEMO_EMERGENCIES, source: 'demo' };
}

export async function fetchAvailableAmbulances() {
  const candidateUrls = ['/api/ambulances', '/api/dispatch/ambulances', '/api/network/ambulances'];

  for (const url of candidateUrls) {
    try {
      const payload = await safeFetchJson(url);
      const list = Array.isArray(payload) ? payload : [payload];
      if (list.length > 0) {
        return {
          items: list
            .map(normalizeAmbulance)
            .filter((ambulance) => ambulance.status === 'AVAILABLE'),
          source: 'backend'
        };
      }
    } catch (error) {
      // Ignore missing endpoints and use the demo fallback below.
    }
  }

  return {
    items: DEMO_AMBULANCES.filter((ambulance) => ambulance.status === 'AVAILABLE'),
    source: 'demo'
  };
}

export async function allocateAmbulance(callId) {
  const url = `/api/dispatch/allocate/${callId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }

  return text || 'Dispatch completed';
}
