/**
 * Contract Service
 *
 * Wraps all contract-related API calls.
 *
 * Backend status:
 *   GET  /contracts  — Backend endpoint not yet implemented
 *   POST /contracts  — Backend endpoint not yet implemented
 */

/**
 * Fetch the list of contracts for the authenticated company.
 *
 * @returns {Promise<Array>} Array of contract objects
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getContracts() {
  // TODO: Uncomment when GET /contracts is available.
  // const response = await api.get("/contracts");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — returning empty array
  return [];
}

/**
 * Fetch a single contract by ID.
 *
 * @param {string} contractId
 * @returns {Promise<object>} Contract object
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getContract(_contractId) {
  // TODO: Uncomment when GET /contracts/:id is available.
  // const response = await api.get(`/contracts/${contractId}`);
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}
