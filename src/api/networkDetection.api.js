import { getJson } from './client.js';

export function fetchNodes() {
  return getJson('/api/network/graph/nodes');
}

export function fetchEdges() {
  return getJson('/api/network/graph/edges');
}

export function fetchAmbulances() {
  return getJson('/api/network/graph/ambulances');
}

export function fetchBlindSpots(thresholdMinutes) {
  return getJson(`/api/network/blind-spots?thresholdMinutes=${thresholdMinutes}`);
}

// thresholds: array of numbers, e.g. [5, 10, 15, 20, 25, 30, 35, 40]
export function fetchCoverageCurve(thresholds) {
  const query = thresholds.join(',');
  return getJson(`/api/network/coverage/curve?thresholds=${query}`);
}
