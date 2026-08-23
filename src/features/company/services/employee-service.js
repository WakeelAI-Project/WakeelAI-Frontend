/**
 * Employee Service
 *
 * Wraps all user and employee-related API calls.
 * All calls go through the shared Axios instance (with Bearer token injected automatically).
 *
 * Backend supports:
 *   POST /users/invite            — ✅ Implemented
 *   GET  /users                   — ✅ Implemented (query: role, page, limit)
 *   PATCH /users/{userId}/status  — ✅ Implemented
 *   GET  /employees               — ✅ Implemented (query: page, limit, status, search)
 *   GET  /employees/:id           — ✅ Implemented
 *
 * Note: GET /employees supports server-side search via the `search` query parameter.
 * The backend filters by full_name and email before applying pagination.
 */

import api from "../../../lib/api";

const SALARY_MIN = 0;
const NATIONAL_ID_LENGTH = 14;
const CONTRACT_TYPES = ["Full-time", "Part-time", "Contract"];
const EDITABLE_EMPLOYEE_FIELDS = [
  "full_name",
  "job_title",
  "department_id",
  "hire_date",
  "salary",
  "contract_type",
  "national_id",
];

export { SALARY_MIN, NATIONAL_ID_LENGTH, CONTRACT_TYPES };

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

const FIELD_NAME_ALIASES = {
  fullName: "full_name",
  FullName: "full_name",
  jobTitle: "job_title",
  JobTitle: "job_title",
  departmentId: "department_id",
  DepartmentId: "department_id",
  hireDate: "hire_date",
  HireDate: "hire_date",
  contractType: "contract_type",
  ContractType: "contract_type",
  nationalId: "national_id",
  NationalId: "national_id",
  Email: "email",
  Salary: "salary",
};

function getEmployeeErrorCode(data) {
  return data?.code || data?.error_code || data?.error || data?.type;
}

function getResponseMessage(data) {
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.title === "string") return data.title;
  return undefined;
}

function normalizeFieldName(field) {
  if (!field) return null;
  const name = String(field).split(".").pop();
  return FIELD_NAME_ALIASES[name] || name;
}

function normalizeFieldErrors(errors) {
  const fieldErrors = {};

  if (!errors) return fieldErrors;

  if (Array.isArray(errors)) {
    errors.forEach((item) => {
      const field = normalizeFieldName(item?.field || item?.name || item?.path);
      const message = item?.message || item?.error;
      if (field && message) fieldErrors[field] = message;
    });
    return fieldErrors;
  }

  if (typeof errors === "object") {
    Object.entries(errors).forEach(([field, value]) => {
      const normalizedField = normalizeFieldName(field);
      const message = Array.isArray(value)
        ? value[0]
        : value?.message || value?.error || value;

      if (normalizedField && typeof message === "string") {
        fieldErrors[normalizedField] = message;
      }
    });
  }

  return fieldErrors;
}

function getEmployeeFieldErrors(data) {
  return {
    ...normalizeFieldErrors(data?.errors),
    ...normalizeFieldErrors(data?.field_errors),
    ...normalizeFieldErrors(data?.validation_errors),
    ...normalizeFieldErrors(data?.details),
    ...normalizeFieldErrors(data?.message),
  };
}

/**
 * Maps backend HTTP status codes to user-facing error messages for user/employee ops.
 *
 * @param {Error} error - Axios error object
 * @returns {string} User-facing error message
 */
function mapEmployeeError(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;
  const code = getEmployeeErrorCode(data);
  const message = getResponseMessage(data);

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 404 && code === "department_not_found") {
    return "Selected department no longer exists.";
  }
  if (status === 404 && code === "employee_not_found") {
    return "This employee no longer exists.";
  }
  if (status === 404) return "User not found.";
  if (status === 409 && code === "email_registered") {
    return "This email is already in use.";
  }
  if (status === 409) return "A user with this email already exists.";
  if (status === 422 || status === 400) {
    return message || "Invalid request.";
  }
  if (status >= 500) return "A server error occurred. Please try again later.";

  return (
    message ||
    error?.message ||
    "An unexpected error occurred."
  );
}

function throwEmployeeError(error) {
  const data = error?.response?.data;
  const err = new Error(mapEmployeeError(error));
  err.status = error?.response?.status;
  err.code = getEmployeeErrorCode(data);
  err.fieldErrors = getEmployeeFieldErrors(data);
  err.cause = error;
  throw err;
}

function compactEmployeePayload(payload, fields) {
  const body = {};

  fields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) return;
    const value = payload[field];

    if (value === undefined || value === "") return;
    body[field] = field === "salary" ? Number(value) : value;
  });

  return body;
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
 * GET /api/employees/{recordId}
 * [Authorize(Roles = "HR_Manager")]
 *
 * @param {string} recordId - UUID of the employee record
 * @returns {Promise<object>} EmployeeDetailResponse
 */
export async function getEmployee(recordId) {
  try {
    const { data } = await api.get(`/employees/${recordId}`);
    return data;
  } catch (error) {
    throwEmployeeError(error);
  }
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
 * Create an employee record for the authenticated company.
 *
 * POST /api/employees
 *
 * @param {{
 *   full_name: string,
 *   email: string,
 *   job_title: string,
 *   department_id: string,
 *   hire_date: string,
 *   salary: number,
 *   contract_type: string,
 *   national_id?: string
 * }} payload
 * @returns {Promise<object>} Created employee record
 */
export async function createEmployee(payload) {
  try {
    const body = compactEmployeePayload(payload, [
      "full_name",
      "email",
      "job_title",
      "department_id",
      "hire_date",
      "salary",
      "contract_type",
      "national_id",
    ]);
    const { data } = await api.post("/employees", body);
    return data;
  } catch (error) {
    throwEmployeeError(error);
  }
}

/**
 * Deactivate an employee record.
 *
 * DELETE /api/employees/{recordId}
 * [Authorize(Roles = "HR_Manager")]
 *
 * @param {string} recordId - UUID of the employee record
 * @returns {Promise<void>}
 */
export async function deactivateEmployee(recordId) {
  try {
    await api.delete(`/employees/${recordId}`);
    // await api.patch(`/users/${recordId}/status`, { is_active: false });
  } catch (error) {
    throwEmployeeError(error);
  }
}

/**
 * Update an employee record. Email is intentionally omitted because v2 does
 * not support changing it through PATCH /api/employees/{record_id}.
 *
 * @param {string} recordId
 * @param {{
 *   full_name?: string,
 *   email?: string,
 *   job_title?: string,
 *   department_id?: string,
 *   hire_date?: string,
 *   salary?: number,
 *   contract_type?: string,
 *   national_id?: string,
 * }} payload
 * @returns {Promise<object>} Updated employee record
 */
export async function updateEmployee(recordId, payload) {
  try {
    const body = compactEmployeePayload(payload, EDITABLE_EMPLOYEE_FIELDS);
    const { data } = await api.patch(`/employees/${recordId}`, body);
    return data;
  } catch (error) {
    throwEmployeeError(error);
  }
}

/**
 * Fetch a paginated list of employees.
 *
 * GET /api/employees
 * Supported query params: page, limit, status, search
 *
 * The backend filters by full_name and email (case-insensitive, partial match)
 * BEFORE applying pagination, so search is server-side and covers all employees.
 *
 * @param {{ page?: number, limit?: number, status?: "Active" | "Inactive", search?: string }} params
 * @returns {Promise<{ data: Array, page: number, total: number }>}
 */
export async function listEmployees({ page = 1, limit = 20, status, search } = {}) {
  const params = { page, limit };

  if (status) {
    params.status = status;
  }

  if (search && search.trim()) {
    params.search = search.trim();
  }

  const { data } = await api.get("/employees", { params });
  return data;
}
