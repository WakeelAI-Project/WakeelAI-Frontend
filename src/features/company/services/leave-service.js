/**
 * Leave Service
 *
 * Wraps all leave-request-related API calls.
 *
 * Backend status:
 *   GET  /leave-requests  — Backend endpoint not yet implemented
 *   POST /leave-requests  — Backend endpoint not yet implemented
 *   PUT  /leave-requests/:id/approve — Backend endpoint not yet implemented
 */

import api from "../../../lib/api";

/**
 * Fetch all leave requests for the authenticated company.
 *
 * @returns {Promise<Array>} Array of leave request objects
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getLeaveRequests() {
  // TODO: Uncomment when GET /leave-requests is available.
  // const response = await api.get("/leave-requests");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — returning empty array
  return [];
}

/**
 * Approve or reject a leave request.
 *
 * @param {string} requestId
 * @param {"approve"|"reject"} action
 * @returns {Promise<object>}
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function updateLeaveRequest(requestId, action) {
  // TODO: Uncomment when PUT /leave-requests/:id is available.
  // const response = await api.put(`/leave-requests/${requestId}`, { action });
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}
