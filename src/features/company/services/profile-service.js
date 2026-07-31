/**
 * Profile Service
 *
 * Wraps user and company profile API calls.
 *
 * Backend status:
 *   GET  /profile/me       — Backend endpoint not yet implemented
 *   GET  /company/profile  — Backend endpoint not yet implemented
 *   PUT  /company/profile  — Backend endpoint not yet implemented
 */

import api from "../../../lib/api";

/**
 * Fetch the authenticated user's own profile.
 *
 * @returns {Promise<object|null>} User profile object
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getUserProfile() {
  // TODO: Uncomment when GET /profile/me is available.
  // const response = await api.get("/profile/me");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — return null (caller falls back to JWT claims)
  return null;
}

/**
 * Fetch the authenticated company's profile.
 *
 * @returns {Promise<object|null>} Company profile object
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getCompanyProfile() {
  // TODO: Uncomment when GET /company/profile is available.
  // const response = await api.get("/company/profile");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — return null
  return null;
}

/**
 * Update the authenticated company's profile.
 *
 * @param {object} updates - Fields to update
 * @returns {Promise<object|null>} Updated company profile
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function updateCompanyProfile(updates) {
  // TODO: Uncomment when PUT /company/profile is available.
  // const response = await api.put("/company/profile", updates);
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}
