/**
 * Profile Service
 *
 * Wraps user and company profile API calls.
 *
 * Backend status:
 *   GET  /profile/me       — Backend endpoint not yet implemented
 *   GET  /company/profile  — ✅ Implemented
 *   PUT  /company/profile  — ✅ Implemented (multipart/form-data)
 */

import api from "../../../lib/api";

// ---------------------------------------------------------------------------
// Normalize helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a raw company profile response from the backend (snake_case)
 * into the camelCase shape consumed by the rest of the app.
 *
 * Backend fields (from PUT /company/profile schema):
 *   Address, PhoneNumber, Email, Industry, WorkingHours, logo (binary)
 * GET response may return additional fields — mapped defensively.
 *
 * @param {object} raw - Raw backend response
 * @returns {object} Normalized company profile
 */
export function normalizeCompanyProfile(raw) {
  if (!raw) return null;

  return {
    // Core identity
    id: raw.id ?? raw.company_id ?? null,
    name: raw.name ?? raw.company_name ?? "",
    legalName: raw.legal_name ?? raw.legalName ?? "",
    taxId: raw.tax_id ?? raw.taxId ?? "",
    industry: raw.Industry ?? raw.industry ?? "",
    size: raw.size ?? raw.company_size ?? "",

    // Contact
    email: raw.Email ?? raw.email ?? "",
    phone: raw.PhoneNumber ?? raw.phone ?? raw.phone_number ?? "",
    headquarters: raw.Address ?? raw.address ?? raw.headquarters ?? "",
    website: raw.website ?? "",

    // Operational
    workingHours: raw.WorkingHours ?? raw.working_hours ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    ownerName: raw.owner_name ?? raw.ownerName ?? "",

    // Status
    policyStatus: raw.policy_status ?? raw.policyStatus ?? "",
    policyUpdatedAt: raw.policy_updated_at ?? raw.policyUpdatedAt ?? null,
    accountStatus: raw.account_status ?? raw.accountStatus ?? "active",

    // Logo
    logoUrl: raw.logo_url ?? raw.logoUrl ?? raw.logo ?? null,
  };
}

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Maps backend HTTP status codes to user-facing error messages for profile ops.
 *
 * @param {Error} error - Axios error object
 * @returns {string} User-facing error message
 */
function mapProfileError(error) {
  const status = error?.response?.status;

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 404) return "Company profile not found.";
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
// Profile service functions
// ---------------------------------------------------------------------------

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
 * GET /company/profile
 * Requires Bearer token. Returns company profile for the token's company_id (server-scoped).
 *
 * @returns {Promise<object|null>} Normalized company profile object, or null on error
 * @throws {Error} With user-facing message on non-404 API errors
 */
export async function getCompanyProfile() {
  try {
    const response = await api.get("/company/profile");
    return normalizeCompanyProfile(response.data);
  } catch (error) {
    throw new Error(mapProfileError(error), { cause: error });
  }
}

/**
 * Update the authenticated company's profile via multipart/form-data.
 *
 * PUT /company/profile
 * Sends: Address, PhoneNumber, Email, Industry, WorkingHours, logo (binary)
 * Maps from the component's camelCase field names to the backend's expected names.
 *
 * @param {object} updates - Profile fields in camelCase
 * @param {string} [updates.headquarters] - Maps to Address
 * @param {string} [updates.phone] - Maps to PhoneNumber
 * @param {string} [updates.email] - Maps to Email
 * @param {string} [updates.industry] - Maps to Industry
 * @param {string} [updates.workingHours] - Maps to WorkingHours
 * @param {File|null} [updates.logo] - Binary logo file
 * @returns {Promise<object|null>} Normalized updated company profile
 * @throws {Error} With user-facing message on API errors
 */
export async function updateCompanyProfile(updates) {
  try {
    const formData = new FormData();

    // Map camelCase component fields → PascalCase backend field names
    if (updates.headquarters != null) formData.append("Address", updates.headquarters);
    if (updates.phone != null) formData.append("PhoneNumber", updates.phone);
    if (updates.email != null) formData.append("Email", updates.email);
    if (updates.industry != null) formData.append("Industry", updates.industry);
    if (updates.workingHours != null) formData.append("WorkingHours", updates.workingHours);

    // Binary logo file — only append when a new file is staged
    if (updates.logo instanceof File) {
      formData.append("logo", updates.logo, updates.logo.name);
    }

    const response = await api.put("/company/profile", formData, {
      headers: {
        // Let the browser set Content-Type with the correct multipart boundary
        "Content-Type": "multipart/form-data",
      },
    });

    return normalizeCompanyProfile(response.data);
  } catch (error) {
    throw new Error(mapProfileError(error), { cause: error });
  }
}
