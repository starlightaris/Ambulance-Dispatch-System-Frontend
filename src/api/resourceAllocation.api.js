import { postJson } from './client.js';

/**
 * Dispatches the best available ambulance for an existing emergency call.
 * Ambulance selection remains server-side so the UI always reports the
 * vehicle that was actually assigned by the backend scheduler.
 */
export function dispatchCall(callId) {
  const normalizedCallId = Number(callId);

  if (!Number.isInteger(normalizedCallId) || normalizedCallId < 1) {
    return Promise.reject(new Error('Enter a valid positive call ID.'));
  }

  return postJson(`/api/v1/calls/${normalizedCallId}/dispatch`);
}
