const triageBaseUrl = '/api/v1/triage';

async function readErrorMessage(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const errorBody = await response.json();

    if (errorBody && typeof errorBody === 'object') {
      if (typeof errorBody.message === 'string') {
        return errorBody.message;
      }

      const fieldMessages = Object.values(errorBody).filter(
        (message) => typeof message === 'string'
      );

      if (fieldMessages.length > 0) {
        return fieldMessages.join(' ');
      }
    }
  }

  return `Request failed with status ${response.status}.`;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export function evaluateTriage(assessmentData) {
  return requestJson(`${triageBaseUrl}/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(assessmentData)
  });
}

export function fetchActiveQueue() {
  return requestJson(`${triageBaseUrl}/queue`);
}

export async function resolveAssessment(assessmentId) {
  const response = await fetch(`${triageBaseUrl}/${assessmentId}/resolve`, {
    method: 'PUT'
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}
