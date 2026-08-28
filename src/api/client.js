async function handle(res, url) {
  if (!res.ok) {
    let message = `${url} -> HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // response wasn't JSON — fall back to the generic message above
    }
    throw new Error(message);
  }
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