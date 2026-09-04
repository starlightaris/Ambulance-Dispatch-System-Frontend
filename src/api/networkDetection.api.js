import { getJson } from './client.js';

const BASE = '/api/v1/network';

export function fetchNodes() {
  return getJson(`${BASE}/graph/nodes`);
}

export function fetchEdges() {
  return getJson(`${BASE}/graph/edges`);
}

export function fetchAmbulances() {
  return getJson(`${BASE}/graph/ambulances`);
}

export function fetchBlindSpots(thresholdMinutes) {
  return getJson(`${BASE}/blind-spots?thresholdMinutes=${thresholdMinutes}`);
}

// thresholds: array of numbers, e.g. [5, 10, 15, 20, 25, 30, 35, 40]
export function fetchCoverageCurve(thresholds) {
  const query = thresholds.join(',');
  return getJson(`${BASE}/coverage?thresholds=${query}`);
}