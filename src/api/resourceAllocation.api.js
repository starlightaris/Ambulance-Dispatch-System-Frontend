import { getJson, postJson } from './client.js';

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

const normalizeEmergency = (call) => {
  const id = call.id ?? call.callId ?? call.uuid;

  if (id == null) {
    throw new Error('Emergency response is missing a call identifier.');
  }

  return {
    id,
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
  };
};

const normalizeAmbulance = (ambulance) => ({
  id: ambulance.id ?? ambulance.ambulanceId,
  vehicleNumber: ambulance.vehicleNumber ?? ambulance.registrationNumber ?? 'AMB-XXX',
  currentLocationNode: ambulance.currentLocationNode ?? ambulance.locationNode ?? 'Unknown node',
  status: ambulance.status ?? 'AVAILABLE',
  equipment: normalizeEquipment(ambulance.equipment ?? []),
  travelMinutes: Number(ambulance.travelMinutes ?? ambulance.distanceMinutes ?? ambulance.score ?? 0)
});

export async function fetchPendingEmergencies() {
  const payload = await getJson('/api/dispatch/pending');
  const list = Array.isArray(payload) ? payload : [payload].filter(Boolean);

  return {
    items: list.map(normalizeEmergency),
    source: 'backend'
  };
}

export async function fetchAvailableAmbulances() {
  const payload = await getJson('/api/dispatch/ambulances');
  const list = Array.isArray(payload) ? payload : [payload].filter(Boolean);

  return {
    items: list
      .map(normalizeAmbulance)
      .filter((ambulance) => ambulance.status === 'AVAILABLE'),
    source: 'backend'
  };
}

export async function allocateAmbulance(callId) {
  const url = `/api/v1/calls/${callId}/dispatch`;
  const result = await postJson(url);

  return result || 'Dispatch completed';
}
