/**
 * Employee Service
 *
 * Wraps all employee-related API calls.
 * All calls go through the shared Axios instance (with Bearer token injected automatically).
 *
 * Backend status:
 *   GET  /employees  — Backend endpoint not yet implemented
 *   POST /employees  — Backend endpoint not yet implemented
 */

import api from "../../../lib/api";

/**
 * Fetch the list of employees for the authenticated company.
 *
 * @returns {Promise<Array>} Array of employee objects
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 * When the backend is ready, this will call GET /employees.
 * Currently returns an empty array so the UI renders without crashing.
 */
export async function getEmployees() {
  // TODO: Uncomment when GET /employees is available on the backend.
  // const response = await api.get("/employees");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — returning empty array
  return [];
}

/**
 * Fetch a single employee by ID.
 *
 * @param {string|number} employeeId
 * @returns {Promise<object>} Employee object
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getEmployee(employeeId) {
  // TODO: Uncomment when GET /employees/:id is available.
  // const response = await api.get(`/employees/${employeeId}`);
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}

/**
 * Invite (create) a new HR employee.
 *
 * @param {{ name: string, email: string }} payload
 * @returns {Promise<object>} Created employee
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function inviteEmployee(payload) {
  // TODO: Uncomment when POST /employees is available.
  // const response = await api.post("/employees", payload);
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}
