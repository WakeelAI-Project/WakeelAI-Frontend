/**
 * User Service
 *
 * Wraps user profile API calls for the authenticated user.
 *
 * Backend status:
 *   GET /api/users/me — ✅ Implemented (HR_Manager only)
 */

import api from "../../../lib/api";

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Maps backend HTTP status codes to user-facing error messages for user profile ops.
 *
 * @param {Error} error - Axios error object
 * @returns {string} User-facing error message
 */
function mapUserError(error) {
  const status = error?.response?.status;

  if (status === 401) return "You are not authenticated. Please log in again.";
  if (status === 403) return "You do not have permission to access this profile.";
  if (status === 404) return "User profile not found.";
  if (status === 422 || status === 400) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      "Invalid request."
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
 * Fetches the current HR Manager's profile information.
 *
 * GET /api/users/me
 * Authorization: Bearer <access_token>
 * Role: HR_Manager only
 *
 * Response:
 * {
 *   "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   "company_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
 *   "full_name": "Omar Khaled",
 *   "email": "omar.khaled@company.com",
 *   "phone": "+201012345678",
 *   "role": "HR_Manager",
 *   "is_active": true,
 *   "created_at": "2025-11-02T09:15:30Z"
 * }
 *
 * @returns {Promise<object>} HR Manager profile data
 * @throws {Error} With user-facing message on API errors
 */
export async function getCurrentUserProfile() {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    throw new Error(mapUserError(error), { cause: error });
  }
}
