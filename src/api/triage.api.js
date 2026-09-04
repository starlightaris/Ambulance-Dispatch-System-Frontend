const triageBaseUrl = '/api/v1/triage/assessments';

async function readErrorMessage(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null);
    if (body?.message) return body.message;
    if (body && typeof body === 'object') {
      const messages = Object.values(body).filter((value) => typeof value === 'string');
      if (messages.length) return messages.join(' ');
    }
  }

  return `Request failed with status ${response.status}.`;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(await readErrorMessage(response));
  return response.json();
}

export function evaluateTriage(assessment) {
  return requestJson(triageBaseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assessment),
  });
}

export function fetchActiveQueue() {
  return requestJson(`${triageBaseUrl}/queue`);
}

export async function resolveAssessment(assessmentId) {
  const response = await fetch(`${triageBaseUrl}/${assessmentId}/resolve`, { method: 'PUT' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}
