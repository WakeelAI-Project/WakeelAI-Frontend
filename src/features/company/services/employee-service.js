/**
 * Employee Service
 *
 * Wraps all user and employee-related API calls.
 * All calls go through the shared Axios instance (with Bearer token injected automatically).
 *
 * Backend status:
 *   POST /users/invite            — ✅ Implemented
 *   GET  /users                   — ✅ Implemented (query: role, page, limit)
 *   PATCH /users/{userId}/status  — ✅ Implemented
 *   GET  /employees               — @status BACKEND ENDPOINT NOT IMPLEMENTED (stub preserved)
 *   GET  /employees/:id           — @status BACKEND ENDPOINT NOT IMPLEMENTED (stub preserved)
 */

import api from "../../../lib/api";

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Maps backend HTTP status codes to user-facing error messages for user/employee ops.
 *
 * @param {Error} error - Axios error object
 * @returns {string} User-facing error message
 */
function mapEmployeeError(error) {
  const status = error?.response?.status;

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 404) return "User not found.";
  if (status === 409) return "A user with this email already exists.";
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
// Normalize helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a raw user object from GET /users into the camelCase shape
 * the rest of the app (EmployeeCard, Table) already expects.
 *
 * @param {object} raw - Raw user object from backend
 * @returns {object} Normalized user object
 */
function normalizeUser(raw) {
  if (!raw) return null;

  return {
    id: raw.id ?? raw.user_id ?? null,
    name: raw.full_name ?? raw.name ?? "",
    nameEn: raw.full_name ?? raw.nameEn ?? raw.name ?? "",
    email: raw.email ?? "",
    role: raw.role ?? "",
    department: raw.department ?? "",
    departmentEn: raw.department ?? raw.departmentEn ?? "",
    status: raw.is_active === false ? "Inactive" : "Active",
    statusText: raw.is_active === false ? "غير نشط" : "نشط",
    phone: raw.phone ?? raw.phone_number ?? "",
    hireDate: raw.hire_date ?? raw.hireDate ?? "",
    salary: raw.salary ?? "",
    isActive: raw.is_active ?? true,
  };
}

// ---------------------------------------------------------------------------
// User / employee service functions
// ---------------------------------------------------------------------------

/**
 * Fetch the list of users for the authenticated company.
 *
 * GET /users
 * Query params: role, page (default 1), limit (default 20)
 *
 * @param {object} [params] - Optional filter/pagination params
 * @param {string} [params.role] - Filter by role (e.g. "HR")
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Items per page
 * @returns {Promise<Array>} Array of normalized user objects
 * @throws {Error} With user-facing message on API errors
 */
export async function getEmployees({ role, page = 1, limit = 20 } = {}) {
  try {
    const params = { page, limit };
    if (role) params.role = role;

    const response = await api.get("/users", { params });

    // Backend may return array directly or wrapped in a pagination envelope
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.items ?? response.data?.data ?? [];

    return raw.map(normalizeUser);
  } catch (error) {
    throw new Error(mapEmployeeError(error), { cause: error });
  }
}

/**
 * Fetch a single employee record by ID.
 *
 * @param {string|number} employeeId
 * @returns {Promise<object|null>} Employee object
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getEmployee(_employeeId) {
  // TODO: Uncomment when GET /employees/:id is available.
  // const response = await api.get(`/employees/${employeeId}`);
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}

/**
 * Invite a new HR user to the company workspace.
 *
 * POST /users/invite
 * Body: { full_name, email, role }
 *
 * @param {{ full_name: string, email: string, role: string }} payload
 * @returns {Promise<object>} Invite result from backend
 * @throws {Error} With user-facing message on API errors
 */
export async function inviteEmployee({ full_name, email, role }) {
  try {
    const response = await api.post("/users/invite", {
      full_name,
      email,
      role,
    });
    return response.data;
  } catch (error) {
    throw new Error(mapEmployeeError(error), { cause: error });
  }
}

/**
 * Activate or deactivate a user account.
 *
 * PATCH /users/{userId}/status
 * Body: { is_active: boolean }
 *
 * @param {string} userId - UUID of the user to update
 * @param {boolean} isActive - true to activate, false to deactivate
 * @returns {Promise<object>} Updated user status from backend
 * @throws {Error} With user-facing message on API errors
 */
export async function updateUserStatus(userId, isActive) {
  try {
    const response = await api.patch(`/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data;
  } catch (error) {
    throw new Error(mapEmployeeError(error), { cause: error });
  }
}

/**
 * @param {{ page?: number, limit?: number, status?: "Active" | "Inactive" }} params
 * @returns {Promise<{ data: Array, page: number, total: number }>}
 */
export async function listEmployees({ page = 1, limit = 20, status } = {}) {
  const params = { page, limit };

  if (status) {
    params.status = status;
  }

  const { data } = await api.get("/employees", { params });
  return data;
}
