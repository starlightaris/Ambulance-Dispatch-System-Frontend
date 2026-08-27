// Relative paths only. In dev, vite.config.js proxies /api to
// http://localhost:8080. In production (after `npm run build`,
// served by Spring Boot itself) these resolve on the same origin.

async function handle(res, url) {
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export function getJson(url) {
  return fetch(url).then((res) => handle(res, url));
}
export function postJson(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => handle(res, url));
}
export function putJson(url, body) {
  return fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => handle(res, url));
}
export function deleteJson(url) {
  return fetch(url, { method: 'DELETE' }).then((res) => handle(res, url));
}