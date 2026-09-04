// Relative paths only. In dev, vite.config.js proxies /api to
// http://localhost:8080. In production (after `npm run build`,
// served by Spring Boot itself) these resolve on the same origin.

export async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} -> HTTP ${res.status}`);
  }
  return res.json();
}

export async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Backend throws IllegalArgumentException / IllegalStateException
    // for bad IDs or no available route — surface that message.
    const text = await res.text().catch(() => '');
    throw new Error(`${url} -> HTTP ${res.status} ${text}`);
  }
  return res.json();
}