/**
 * Department Service — GET/POST/PATCH/DELETE /departments (Owner)
 */

import api from "../../../lib/api";

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

export { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH };

function mapDepartmentError(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (data?.message) return data.message;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 404) return "Department not found.";
  if (status === 400 || status === 422) {
    return data?.message || "Invalid request. Please check your input.";
  }
  if (status >= 500) return "A server error occurred. Please try again later.";

  return data?.error || error?.message || "An unexpected error occurred.";
}

function throwDepartmentError(error) {
  const err = new Error(mapDepartmentError(error));
  err.status = error?.response?.status;
  err.cause = error;
  throw err;
}

/**
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<{ data: Array, page: number, total: number }>}
 */
export async function listDepartments({ page = 1, limit = 50 } = {}) {
  try {
    const { data } = await api.get("/departments", { params: { page, limit } });
    return data;
  } catch (error) {
    throwDepartmentError(error);
  }
}

/**
 * @param {{ name: string, description?: string }} payload
 */
export async function createDepartment(payload) {
  try {
    const body = { name: payload.name };
    if (payload.description !== undefined && payload.description !== "") {
      body.description = payload.description;
    }
    const { data } = await api.post("/departments", body);
    return data;
  } catch (error) {
    throwDepartmentError(error);
  }
}

/**
 * @param {string} departmentId
 * @param {{ name?: string, description?: string }} payload
 */
export async function updateDepartment(departmentId, payload) {
  try {
    const { data } = await api.patch(`/departments/${departmentId}`, payload);
    return data;
  } catch (error) {
    throwDepartmentError(error);
  }
}

/**
 * @param {string} departmentId
 */
export async function deleteDepartment(departmentId) {
  try {
    await api.delete(`/departments/${departmentId}`);
  } catch (error) {
    throwDepartmentError(error);
  }
}
