import { postJson } from './client.js';

/**
 * Calls POST /api/routing/find-route.
 *
 * Backend currently always runs A* internally (RouteServiceImpl ignores
 * the `algorithm` field for now), but we still send it so the request
 * shape matches RouteRequest.java and nothing needs to change here if
 * that gets wired up later.
 *
 * @param {number} startLocationId
 * @param {number} destinationLocationId
 * @param {string} [algorithm='ASTAR']
 * @returns {Promise<{algorithm: string, totalTravelTimeMinutes: number, totalDistanceKm: number, route: Array<{id:number, name:string, latitude:number, longitude:number}>}>}
 */
export function findRoute(startLocationId, destinationLocationId, algorithm = 'ASTAR') {
  return postJson('/api/routing/find-route', {
    startLocationId,
    destinationLocationId,
    algorithm,
  });
}