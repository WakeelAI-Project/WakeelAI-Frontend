/**
 * Account Service
 *
 * Wraps account management API calls for the authenticated user.
 *
 * Backend status:
 *   POST /account/change-password — ✅ Implemented
 */

import api from "../../../lib/api";

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Maps backend HTTP status codes to user-facing error messages for account ops.
 *
 * @param {Error} error - Axios error object
 * @returns {string} User-facing error message
 */
function mapAccountError(error) {
  const status = error?.response?.status;

  if (status === 401) return "Your current password is incorrect.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 422 || status === 400) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      "Invalid request. New password must be at least 8 characters."
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
// Account service functions
// ---------------------------------------------------------------------------

/**
 * Changes the authenticated user's password.
 *
 * POST /account/change-password
 * Body: { current_password, new_password }
 * Response: 200 OK (no body)
 *
 * @param {{ current_password: string, new_password: string }} payload
 * @returns {Promise<void>}
 * @throws {Error} With user-facing message on API errors
 */
export async function changePassword({ current_password, new_password }) {
  try {
    await api.post("/account/change-password", {
      current_password,
      new_password,
    });
  } catch (error) {
    throw new Error(mapAccountError(error), { cause: error });
  }
}
