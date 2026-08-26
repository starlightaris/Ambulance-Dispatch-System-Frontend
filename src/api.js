// Relative paths only. In dev, vite.config.js proxies /api to
// http://localhost:8080. In production (after `npm run build`,
// served by Spring Boot itself) these resolve on the same origin.

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} -> HTTP ${res.status}`);
  }
  return res.json();
}

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