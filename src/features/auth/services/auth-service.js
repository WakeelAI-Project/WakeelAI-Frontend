import api from "../../../lib/api";

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes any backend auth response into a single canonical shape.
 *
 * Every login / register / refresh response goes through this function so
 * the rest of the app always works with consistent field names regardless
 * of which endpoint produced the response.
 *
 * @param {object} raw - Raw response data from the backend
 * @returns {{ token: string|null, refreshToken: string|null, expiresIn: number|null, companyId: string|null, userId: string|null, role: string|null }}
 */
export function normalizeAuthResponse(raw) {
  if (!raw) {
    return {
      token: null,
      refreshToken: null,
      expiresIn: null,
      companyId: null,
      userId: null,
      role: null,
    };
  }

  return {
    token: raw.access_token ?? raw.token ?? null,
    refreshToken: raw.refresh_token ?? null,
    expiresIn: raw.expires_in ?? null,
    companyId: raw.company_id ?? null,
    userId: raw.user_id ?? null,
    role: raw.role ?? null,
  };
}

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Maps backend HTTP status codes to user-facing error messages.
 *
 * @param {Error} error - Axios error object
 * @returns {string} User-facing error message
 */
function mapAuthError(error) {
  const status = error?.response?.status;

  if (status === 401) return "Invalid email or password.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 409) return "An account with this email already exists.";
  if (status === 422 || status === 400) {
    const detail =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      "Invalid request. Please check your input.";
    return detail;
  }
  if (status >= 500) return "A server error occurred. Please try again later.";

  return (
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred."
  );
}

// ---------------------------------------------------------------------------
// Auth service functions
// ---------------------------------------------------------------------------

/**
 * Sends a login request to the backend.
 * Works for both HR employees and Company Owners.
 *
 * Returns raw backend response. Callers should use normalizeAuthResponse().
 *
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { token: "JWT_TOKEN" }   (or access_token depending on backend shape)
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Raw backend response
 */
export async function login(email, password) {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(mapAuthError(error), { cause: error });
  }
}

/**
 * Registers a new company and its owner via POST /auth/register-company.
 *
 * The backend immediately authenticates the owner and returns a valid
 * access_token. Callers should pass the returned token to setToken().
 *
 * @param {{ company_name: string, tax_id: string, owner_full_name: string, owner_email: string, password: string }} data
 * @returns {Promise<object>} Raw backend response (use normalizeAuthResponse() on result)
 */
export async function registerCompany(data) {
  try {
    const response = await api.post("/auth/register-company", {
      company_name: data.company_name,
      tax_id: data.tax_id,
      owner_full_name: data.owner_full_name,
      owner_email: data.owner_email,
      password: data.password,
    });
    return response.data;
  } catch (error) {
    throw new Error(mapAuthError(error), { cause: error });
  }
}

/**
 * Exchanges a refresh token for a new access token via POST /auth/refresh.
 *
 * Returns raw backend response — callers use normalizeAuthResponse() on it.
 * Throws if the refresh token is invalid or the network request fails.
 *
 * @param {string} refreshToken
 * @returns {Promise<object>} Raw backend response: { access_token, expires_in }
 */
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  try {
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    throw new Error(mapAuthError(error), { cause: error });
  }
}

/**
 * Calls POST /auth/logout with the current Authorization header.
 *
 * Always resolves — never throws. Network failures are silently swallowed
 * because logout must always clear local state regardless of backend response.
 *
 * @returns {Promise<void>}
 */
export async function logoutApi() {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Swallow all errors — logout must always succeed locally
    console.warn("[auth] Logout request failed (ignored):", error?.message);
  }
}
