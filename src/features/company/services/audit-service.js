/**
 * Audit Service
 *
 * Wraps all audit-log-related API calls.
 *
 * Backend status:
 *   GET /audit  — Backend endpoint not yet implemented
 */

import api from "../../../lib/api";

/**
 * Fetch the audit event log for the authenticated company.
 *
 * @returns {Promise<Array>} Array of audit event objects
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getAuditEvents() {
  // TODO: Uncomment when GET /audit is available.
  // const response = await api.get("/audit");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — returning empty array
  return [];
}
