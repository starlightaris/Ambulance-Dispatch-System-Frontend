// Relative paths only. In dev, vite.config.js proxies /api to
// http://localhost:8080. In production (after `npm run build`,
// served by Spring Boot itself) these resolve on the same origin.

async function readBody(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(url, res, body) {
  const message = body && typeof body === 'object' ? body.message : body;
  return `${url} -> HTTP ${res.status}${message ? ` ${message}` : ''}`;
}

export async function getJson(url) {
  const res = await fetch(url);
  const body = await readBody(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(url, res, body));
  }

  return body;
}

export async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const responseBody = await readBody(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(url, res, responseBody));
  }

  return responseBody;
}