/**
 * Company policy upload service.
 *
 * Backend contract:
 *   POST /api/company/policies
 *   form-data: pdf (File), title (string)
 */

import api from "../../../lib/api";

export async function uploadCompanyPolicy({ pdf, title }) {
  if (!(pdf instanceof File)) {
    const error = new Error("A PDF file is required.");
    error.status = 400;
    throw error;
  }

  if (!title || !String(title).trim()) {
    const error = new Error("Policy title is required.");
    error.status = 400;
    throw error;
  }

  const formData = new FormData();
  formData.append("pdf", pdf, pdf.name);
  formData.append("title", String(title).trim());

  try {
    const { data } = await api.post("/company/policies", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      error?.message ||
      "Unable to upload the policy PDF.";

    const wrapped = new Error(message);
    wrapped.status = status;
    wrapped.cause = error;
    throw wrapped;
  }
}

export async function getCompanyPolicy() {
  try {
    const { data } = await api.get("/company/policy");
    return data;
  } catch (error) {
    return { has_policy: false, policy: null };
  }
}
