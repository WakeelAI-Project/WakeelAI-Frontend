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

export function normalizeCompanyProfile(raw) {
  if (!raw) return null;

  return {
    id: raw.id ?? raw.company_id ?? null,
    name: raw.name ?? raw.company_name ?? "",
    industry: raw.Industry ?? raw.industry ?? "",

    email: raw.Email ?? raw.email ?? "",
    phone: raw.PhoneNumber ?? raw.phone ?? raw.phone_number ?? "",
    headquarters: raw.Address ?? raw.address ?? raw.headquarters ?? "",

    workingHours: raw.WorkingHours ?? raw.working_hours ?? "",
    createdAt: raw.registered_at ?? raw.created_at ?? raw.createdAt ?? null,

    logoUrl: raw.logo_url ?? raw.logoUrl ?? raw.logo ?? null,
  };
}

function mapProfileError(error) {
  const status = error?.response?.status;

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to view this company profile.";
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

function throwProfileError(error) {
  const err = new Error(mapProfileError(error));
  err.status = error?.response?.status;
  err.cause = error;
  throw err;
}

export async function getUserProfile() {
  return null;
}

/**
 * @returns {Promise<object|null>} Normalized company profile object
 * @throws {Error} with `.status` set — callers must branch on `.status === 403`.
 */
export async function getCompanyProfile() {
  try {
    const response = await api.get("/company/profile");
    return normalizeCompanyProfile(response.data);
  } catch (error) {
    throwProfileError(error);
  }
}

export async function updateCompanyProfile(updates) {
  try {
    const formData = new FormData();

    formData.append("Address", updates.headquarters ?? "");
    formData.append("PhoneNumber", updates.phone ?? "");
    formData.append("Email", updates.email ?? "");
    formData.append("Industry", updates.industry ?? "");
    formData.append("WorkingHours", updates.workingHours ?? "");

    if (updates.logo instanceof File) {
      formData.append("logo", updates.logo, updates.logo.name);
    }

    const response = await api.put("/company/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return normalizeCompanyProfile(response.data);
  } catch (error) {
    throwProfileError(error);
  }
}
