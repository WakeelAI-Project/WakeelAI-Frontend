/**
 * Document Service
 *
 * Backend contract inspected 2026-08-14:
 * - Internal M2M only:
 *   GET  /api/ai/templates/active
 *   POST /api/documents/save
 * - Public HR document list/detail/review endpoints are not exposed yet.
 *
 * The browser must not call the internal M2M endpoints because they are
 * secured for the Node AI service. Keep this boundary explicit until the
 * backend publishes HR-facing document APIs.
 */

export const DOCUMENT_BACKEND_STATUS = Object.freeze({
  READY: "ready",
  PENDING_BACKEND_CONTRACT: "pending_backend_contract",
});

export const DOCUMENT_BACKEND_CAPABILITIES = Object.freeze({
  canList: false,
  canRead: false,
  canUpload: false,
  canDelete: false,
  canFinalize: false,
  canReject: false,
  canSearch: false,
  canFilterByStatus: false,
  canFilterByType: false,
});

const DOCUMENT_API_PENDING_CODE = "documents_api_pending_backend_contract";

function createDocumentApiUnavailableError(operation) {
  const error = new Error(
    "Public HR document endpoints are not available in the current backend contract.",
  );
  error.code = DOCUMENT_API_PENDING_CODE;
  error.operation = operation;
  error.retryable = false;
  return error;
}

export function isDocumentApiUnavailableError(error) {
  return error?.code === DOCUMENT_API_PENDING_CODE;
}

export function getDocumentId(document) {
  return document?.id ?? document?.documentId ?? document?.document_id ?? null;
}

/**
 * Fetch documents for the authenticated company.
 *
 * @returns {Promise<{data: Array, page: number, total: number, status: string, capabilities: object}>}
 */
export async function getDocuments({ page = 1 } = {}) {
  return {
    data: [],
    page,
    total: 0,
    status: DOCUMENT_BACKEND_STATUS.PENDING_BACKEND_CONTRACT,
    capabilities: DOCUMENT_BACKEND_CAPABILITIES,
  };
}

/**
 * Fetch one generated document for HR review.
 *
 * @param {string} documentId
 */
export async function getDocument(documentId) {
  if (!documentId) {
    const error = new Error("documentId is required.");
    error.code = "validation_error";
    error.retryable = false;
    throw error;
  }

  throw createDocumentApiUnavailableError("getDocument");
}

export async function uploadDocument() {
  throw createDocumentApiUnavailableError("uploadDocument");
}

export async function deleteDocument() {
  throw createDocumentApiUnavailableError("deleteDocument");
}
