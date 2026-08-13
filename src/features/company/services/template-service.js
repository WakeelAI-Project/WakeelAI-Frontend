/**
 * Document Template Service
 *
 * Backend contract inspected 2026-08-14:
 * - The current .NET source contains DocumentTemplate persistence and an
 *   internal M2M active-template lookup for the AI service.
 * - Public HR CRUD endpoints such as GET /templates or POST /templates are
 *   not implemented in the current backend source.
 *
 * Keep browser integration blocked here until those public endpoints exist.
 */

export const TEMPLATE_BACKEND_STATUS = Object.freeze({
  READY: "ready",
  PENDING_BACKEND_CONTRACT: "pending_backend_contract",
});

export const TEMPLATE_BACKEND_CAPABILITIES = Object.freeze({
  canList: false,
  canRead: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  canToggleActive: false,
  canFilterByDocumentType: false,
});

const TEMPLATE_API_PENDING_CODE = "templates_api_pending_backend_contract";

function createTemplateApiUnavailableError(operation) {
  const error = new Error(
    "Public HR template endpoints are not available in the current backend contract.",
  );
  error.code = TEMPLATE_API_PENDING_CODE;
  error.operation = operation;
  error.retryable = false;
  return error;
}

export function isTemplateApiUnavailableError(error) {
  return error?.code === TEMPLATE_API_PENDING_CODE;
}

export async function getTemplates({ page = 1, limit = 20 } = {}) {
  return {
    data: [],
    page,
    limit,
    total: 0,
    status: TEMPLATE_BACKEND_STATUS.PENDING_BACKEND_CONTRACT,
    capabilities: TEMPLATE_BACKEND_CAPABILITIES,
  };
}

export async function getTemplate(templateId) {
  if (!templateId) {
    const error = new Error("templateId is required.");
    error.code = "validation_error";
    error.retryable = false;
    throw error;
  }

  throw createTemplateApiUnavailableError("getTemplate");
}

export async function createTemplate() {
  throw createTemplateApiUnavailableError("createTemplate");
}

export async function updateTemplate(templateId) {
  if (!templateId) {
    const error = new Error("templateId is required.");
    error.code = "validation_error";
    error.retryable = false;
    throw error;
  }

  throw createTemplateApiUnavailableError("updateTemplate");
}

export async function deleteTemplate(templateId) {
  if (!templateId) {
    const error = new Error("templateId is required.");
    error.code = "validation_error";
    error.retryable = false;
    throw error;
  }

  throw createTemplateApiUnavailableError("deleteTemplate");
}
