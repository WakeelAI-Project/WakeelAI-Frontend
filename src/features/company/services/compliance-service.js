/**
 * Compliance Service
 *
 * Wraps all compliance-check-related API calls.
 *
 * Backend status:
 *   GET /compliance  — Backend endpoint not yet implemented
 */

import api from "../../../lib/api";

/**
 * Fetch compliance items / audit results for the authenticated company.
 *
 * @returns {Promise<Array>} Array of compliance item objects
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getComplianceItems() {
  // TODO: Uncomment when GET /compliance is available.
  // const response = await api.get("/compliance");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — returning empty array
  return [];
}
