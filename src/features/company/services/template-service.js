/**
 * Document Template Service
 *
 * Backend contract integration verified:
 *   GET    /api/Templates
 *   GET    /api/Templates/{id}
 *   POST   /api/Templates
 *   PATCH  /api/Templates/{id}
 *   DELETE /api/Templates/{id}
 */

import api from "../../../lib/api"

export const TEMPLATE_BACKEND_STATUS = Object.freeze({
  READY: "ready",
  PENDING_BACKEND_CONTRACT: "pending_backend_contract",
})

export const TEMPLATE_BACKEND_CAPABILITIES = Object.freeze({
  canList: true,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  canToggleActive: true,
  canFilterByDocumentType: true,
})

const TEMPLATE_API_PENDING_CODE = "templates_api_pending_backend_contract"

export function isTemplateApiUnavailableError(error) {
  return error?.code === TEMPLATE_API_PENDING_CODE
}

export async function getTemplates({ page = 1, limit = 20, documentType } = {}) {
  const params = { page, limit }
  if (documentType && documentType !== "all") {
    params.documentType = documentType
  }

  const { data } = await api.get("/Templates", { params })

  return {
    data: data?.data ?? [],
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    total: data?.total ?? 0,
    status: TEMPLATE_BACKEND_STATUS.READY,
    capabilities: TEMPLATE_BACKEND_CAPABILITIES,
  }
}

export async function getTemplate(templateId) {
  if (!templateId) {
    const error = new Error("templateId is required.")
    error.code = "validation_error"
    error.retryable = false
    throw error
  }

  const { data } = await api.get(`/Templates/${templateId}`)
  return data
}

export async function createTemplate(payload) {
  const { data } = await api.post("/Templates", payload)
  return data
}

export async function updateTemplate(templateId, payload) {
  if (!templateId) {
    const error = new Error("templateId is required.")
    error.code = "validation_error"
    error.retryable = false
    throw error
  }

  const { data } = await api.patch(`/Templates/${templateId}`, payload)
  return data
}

export async function deleteTemplate(templateId) {
  if (!templateId) {
    const error = new Error("templateId is required.")
    error.code = "validation_error"
    error.retryable = false
    throw error
  }

  await api.delete(`/Templates/${templateId}`)
}
