/**
 * User Service
 *
 * Wraps user management API calls (Owner-only endpoints).
 *
 * Backend endpoints:
 *   GET /api/users?role=HR_Manager — ✅ Implemented (Owner only)
 */

import api from "../../../lib/api";

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Maps backend HTTP status codes to user-facing error messages for user operations.
 *
 * @param {Error} error - Axios error object
 * @returns {string} User-facing error message
 */
function mapUserError(error) {
  const status = error?.response?.status;

  if (status === 401) return "You are not authenticated. Please log in again.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 404) return "User not found.";
  if (status === 422 || status === 400) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      "Invalid request. Please check your input."
    );
  }
  if (status >= 500) return "A server error occurred. Please try again later.";

  return (
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred."
  );
}

// ---------------------------------------------------------------------------
// User service functions
// ---------------------------------------------------------------------------

/**
 * Fetches the list of users for the authenticated company.
 * Optionally filters by role.
 *
 * GET /api/users?role={role}&page={page}&limit={limit}
 * Response: { data: UserListItem[], page: number, total: number }
 *
 * @param {{ role?: string, page?: number, limit?: number }} options
 * @returns {Promise<{ data: Array, page: number, total: number }>}
 * @throws {Error} With user-facing message on API errors
 */
export async function listUsers({ role, page = 1, limit = 100 } = {}) {
  try {
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(mapUserError(error), { cause: error });
  }
}

/**
 * Fetches HR Manager users for the authenticated company.
 * Convenience wrapper around listUsers with role filter.
 *
 * @returns {Promise<{ data: Array, page: number, total: number }>}
 */
export async function listHRUsers() {
  return listUsers({ role: "HR_Manager", limit: 100 });
}
