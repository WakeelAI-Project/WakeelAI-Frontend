/**
 * Document Service
 *
 * Backend contract integration verified:
 *   GET   /api/Documents
 *   GET   /api/Documents/{id}
 *   PATCH /api/Documents/{id}
 *   POST  /api/Documents/{id}/finalize
 *   POST  /api/Documents/{id}/send-email
 */

import api from "../../../lib/api";

export const DOCUMENT_BACKEND_STATUS = Object.freeze({
  READY: "ready",
  PENDING_BACKEND_CONTRACT: "pending_backend_contract",
});

export const DOCUMENT_BACKEND_CAPABILITIES = Object.freeze({
  canList: true,
  canRead: true,
  canUpload: false,
  canDelete: false,
  canFinalize: true,
  canReject: false,
  canSearch: false,
  canFilterByStatus: true,
  canFilterByType: true,
  canUpdate: true,
  canSendEmail: true,
});

const DOCUMENT_API_PENDING_CODE = "documents_api_pending_backend_contract";

function createDocumentApiUnavailableError(operation) {
  const error = new Error(
    "This document operation is not available in the current backend contract.",
  );
  error.code = DOCUMENT_API_PENDING_CODE;
  error.operation = operation;
  error.retryable = false;
  return error;
}

export function isDocumentApiUnavailableError(error) {
  return error?.code === DOCUMENT_API_PENDING_CODE;
}

function getResponseMessage(data) {
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.title === "string") return data.title;
  return undefined;
}

function mapDocumentError(error) {
  const status = error?.response?.status;
  const message = getResponseMessage(error?.response?.data);

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not authorized to perform this action.";
  if (status === 404) return "This document could not be found.";
  if (status === 409)
    return (
      message ||
      "This action can't be completed in the document's current state."
    );
  if (status === 422 || status === 400)
    return message || "Invalid request. Please check your input.";
  if (status >= 500) return "A server error occurred. Please try again later.";

  return message || error?.message || "An unexpected error occurred.";
}

function throwDocumentError(error) {
  const err = new Error(mapDocumentError(error));
  err.status = error?.response?.status;
  err.cause = error;
  throw err;
}

export function getDocumentId(document) {
  return document?.id ?? document?.documentId ?? document?.document_id ?? null;
}

function normalizeDocumentSummary(doc) {
  return {
    ...doc,
    documentType: doc.document_type,
    employeeId: doc.employee_id,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

function normalizeDocumentDetail(doc) {
  return {
    ...doc,
    documentType: doc.document_type,
    contentHtml: doc.content_html,
    pdfUrl: doc.pdf_url,
    employeeId: doc.employee_id,
    templateId: doc.template_id,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    finalizedAt: doc.finalized_at,
  };
}

/**
 * Fetch documents for the authenticated company.
 */
export async function getDocuments({
  page = 1,
  limit = 20,
  type,
  status,
  employeeId,
  sort,
  order,
} = {}) {
  const params = { page, limit };
  if (type) params.type = type;
  if (status) params.status = status;
  if (employeeId) params.employee_id = employeeId;
  if (sort) params.sort = sort;
  if (order) params.order = order;

  const { data } = await api.get("/Documents", { params });
  return {
    data: (data?.data || []).map(normalizeDocumentSummary),
    page: data?.page ?? page,
    total: data?.total ?? 0,
    status: DOCUMENT_BACKEND_STATUS.READY,
    capabilities: DOCUMENT_BACKEND_CAPABILITIES,
  };
}

/**
 * Fetch one generated document for HR review.
 */
export async function getDocument(documentId) {
  if (!documentId) {
    const error = new Error("documentId is required.");
    error.code = "validation_error";
    error.retryable = false;
    throw error;
  }

  const { data } = await api.get(`/Documents/${documentId}`);
  return normalizeDocumentDetail(data);
}

/**
 * Update an existing draft document.
 */
export async function updateDocument(documentId, { title, contentHtml }) {
  if (!documentId) throw new Error("documentId is required.");

  const { data } = await api.patch(`/Documents/${documentId}`, {
    title,
    content_html: contentHtml,
  });
  return data;
}

/**
 * Finalize a draft document (generates PDF and sets status).
 */
export async function finalizeDocument(documentId) {
  if (!documentId) throw new Error("documentId is required.");

  try {
    await api.post(`/Documents/${documentId}/finalize`);
  } catch (error) {
    throwDocumentError(error);
  }
}

/**
 * Send the finalized document via email.
 */
export async function sendDocumentEmail(documentId, emailTo = null) {
  if (!documentId) throw new Error("documentId is required.");

  try {
    const body = emailTo ? { email_to: emailTo } : {};
    await api.post(`/Documents/${documentId}/send-email`, body);
  } catch (error) {
    throwDocumentError(error);
  }
}

export async function uploadDocument() {
  throw createDocumentApiUnavailableError("uploadDocument");
}

export async function deleteDocument() {
  throw createDocumentApiUnavailableError("deleteDocument");
}
