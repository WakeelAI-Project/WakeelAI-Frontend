import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Eye, FileText, Plus, Power, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Table } from "../components/data-display/table"
import { EmptyState } from "../components/layout/empty-state"
import { Pagination } from "../components/navigation/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/overlay/dialog"
import { Alert } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { SegmentedControl } from "../components/ui/segmented-control"
import { Skeleton } from "../components/ui/skeleton"
import { useToast } from "../components/ui/toast"
import {
  deleteTemplate,
  getTemplates,
  isTemplateApiUnavailableError,
  TEMPLATE_BACKEND_STATUS,
} from "../features/company/services/template-service"
import { updateTemplate } from "../features/company/services/template-service"
import {
  DOCUMENT_TEMPLATE_TYPES,
  getDocumentTypeLabelKey,
  getTemplateDocumentType,
  getTemplateId,
  getTemplateIsActive,
  getTemplateName,
} from "../features/company/templates/template-placeholders"
import { PageShell } from "./page-shell"

const PAGE_SIZE = 20

function getErrorMessage(t, error) {
  if (isTemplateApiUnavailableError(error)) return t("templates.errors.backendPending")
  if (error?.status === 403) return t("templates.errors.forbidden")
  if (error?.status === 404) return t("templates.errors.notFound")
  if (error?.status === 409 && error?.code === "template_active") {
    return t("templates.errors.templateActive")
  }
  if (error?.status === 409 && error?.code === "template_required") {
    return t("templates.errors.templateRequired")
  }
  if (error?.status >= 500) return t("templates.errors.server")
  return error?.message || t("templates.errors.generic")
}

function statusBadge(t, template) {
  const active = getTemplateIsActive(template)
  return (
    <Badge variant={active ? "success" : "employee"} shape="pill">
      {active ? t("templates.active") : t("templates.inactive")}
    </Badge>
  )
}

function TemplatesLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export function TemplatesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [templates, setTemplates] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendStatus, setBackendStatus] = useState(TEMPLATE_BACKEND_STATUS.READY)
  const [capabilities, setCapabilities] = useState(null)
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all")
  const [toggleTarget, setToggleTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isMutating, setIsMutating] = useState(false)

  const isPendingBackend = backendStatus === TEMPLATE_BACKEND_STATUS.PENDING_BACKEND_CONTRACT
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getTemplates({ page, limit: PAGE_SIZE })
      setTemplates(response?.data ?? [])
      setTotal(response?.total ?? 0)
      setBackendStatus(response?.status ?? TEMPLATE_BACKEND_STATUS.READY)
      setCapabilities(response?.capabilities ?? null)
    } catch (err) {
      setTemplates([])
      setTotal(0)
      setBackendStatus(TEMPLATE_BACKEND_STATUS.READY)
      setError(getErrorMessage(t, err))
    } finally {
      setLoading(false)
    }
  }, [page, t])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const filteredTemplates = useMemo(() => {
    if (documentTypeFilter === "all") return templates
    return templates.filter((template) => getTemplateDocumentType(template) === documentTypeFilter)
  }, [documentTypeFilter, templates])

  const groupedTemplates = useMemo(() => (
    DOCUMENT_TEMPLATE_TYPES.map((documentType) => ({
      documentType,
      templates: filteredTemplates.filter((template) => (
        getTemplateDocumentType(template) === documentType
      )),
    })).filter((group) => documentTypeFilter === "all" || group.documentType === documentTypeFilter)
  ), [documentTypeFilter, filteredTemplates])

  const columns = useMemo(() => [
    {
      title: t("templates.columns.name"),
      key: "name",
      render: (_value, row) => (
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-(--legal-primary)" aria-hidden="true" />
          <span className="truncate font-medium">{getTemplateName(row)}</span>
        </div>
      ),
    },
    {
      title: t("templates.columns.documentType"),
      key: "document_type",
      render: (_value, row) => t(getDocumentTypeLabelKey(getTemplateDocumentType(row))),
    },
    {
      title: t("templates.columns.status"),
      key: "is_active",
      render: (_value, row) => statusBadge(t, row),
    },
    {
      title: t("templates.columns.actions"),
      key: "actions",
      render: (_value, row) => {
        const templateId = getTemplateId(row)
        const active = getTemplateIsActive(row)

        return (
          <div className="flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!templateId}
              onClick={() => navigate(`/hr/templates/${encodeURIComponent(String(templateId))}/edit`)}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {t("templates.edit")}
            </Button>
            {capabilities?.canToggleActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!templateId}
                onClick={() => setToggleTarget(row)}
              >
                <Power className="h-4 w-4" aria-hidden="true" />
                {active ? t("templates.deactivate") : t("templates.activate")}
              </Button>
            )}
            {capabilities?.canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-(--status-error-fg) hover:text-(--status-error-fg)"
                disabled={!templateId}
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {t("templates.delete")}
              </Button>
            )}
          </div>
        )
      },
    },
  ], [capabilities?.canDelete, capabilities?.canToggleActive, navigate, t])

  const confirmToggle = async () => {
    if (!toggleTarget) return

    setIsMutating(true)
    try {
      await updateTemplate(getTemplateId(toggleTarget), {
        is_active: !getTemplateIsActive(toggleTarget),
      })
      setToggleTarget(null)
      toast({ type: "success", message: t("templates.messages.statusUpdated") })
      loadTemplates()
    } catch (err) {
      toast({
        type: "error",
        message: t("common.error"),
        description: getErrorMessage(t, err),
      })
    } finally {
      setIsMutating(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setIsMutating(true)
    try {
      await deleteTemplate(getTemplateId(deleteTarget))
      setDeleteTarget(null)
      toast({ type: "success", message: t("templates.messages.deleted") })
      loadTemplates()
    } catch (err) {
      toast({
        type: "error",
        message: t("common.error"),
        description: getErrorMessage(t, err),
      })
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <PageShell
      eyebrow={t("templates.eyebrow")}
      title={t("templates.title")}
      description={t("templates.description")}
    >
      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-(--text-secondary)">
              {isPendingBackend ? t("templates.backendPendingHint") : t("templates.listHint")}
            </p>
          </div>
          <Button type="button" onClick={() => navigate("/hr/templates/new")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("templates.create")}
          </Button>
        </div>

        <div className="mb-5 overflow-x-auto pb-1">
          <SegmentedControl
            name="templates-document-type-filter"
            value={documentTypeFilter}
            onChange={setDocumentTypeFilter}
            options={[
              { value: "all", label: t("templates.filters.all") },
              ...DOCUMENT_TEMPLATE_TYPES.map((documentType) => ({
                value: documentType,
                label: t(getDocumentTypeLabelKey(documentType)),
              })),
            ]}
          />
        </div>

        {isPendingBackend && (
          <Alert variant="warning" title={t("templates.backendPendingTitle")} className="mb-5">
            {t("templates.backendPendingDescription")}
          </Alert>
        )}

        {loading ? (
          <TemplatesLoading />
        ) : error ? (
          <EmptyState
            illustrationType="offline"
            title={t("templates.loadErrorTitle")}
            description={error}
            actionText={t("common.retry")}
            onActionClick={loadTemplates}
          />
        ) : isPendingBackend ? (
          <EmptyState
            illustrationType="document"
            title={t("templates.backendPendingTitle")}
            description={t("templates.backendPendingEmptyDescription")}
          />
        ) : templates.length === 0 ? (
          <EmptyState
            illustrationType="document"
            title={t("templates.emptyTitle")}
            description={t("templates.emptyDescription")}
            actionText={t("templates.create")}
            onActionClick={() => navigate("/hr/templates/new")}
          />
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            illustrationType="search"
            title={t("templates.noFilterResultsTitle")}
            description={t("templates.noFilterResultsDescription")}
          />
        ) : (
          <div className="space-y-6">
            {groupedTemplates.map((group) => (
              group.templates.length > 0 && (
                <section key={group.documentType} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-(--text-primary)">
                      {t(getDocumentTypeLabelKey(group.documentType))}
                    </h3>
                    <Badge variant="document" shape="pill">
                      {t("templates.templateCount", { count: group.templates.length })}
                    </Badge>
                  </div>
                  <Table
                    columns={columns}
                    data={group.templates.map((template) => ({
                      ...template,
                      id: getTemplateId(template),
                    }))}
                    onRowClick={(template) => {
                      const templateId = getTemplateId(template)
                      if (templateId) {
                        navigate(`/hr/templates/${encodeURIComponent(String(templateId))}/edit`)
                      }
                    }}
                  />
                </section>
              )
            ))}

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-(--text-secondary)">
                  {t("templates.pageSummary", { page, totalPages, total })}
                </p>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <Dialog
        open={!!toggleTarget}
        onOpenChange={(open) => {
          if (!open && !isMutating) setToggleTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getTemplateIsActive(toggleTarget)
                ? t("templates.confirmDeactivateTitle")
                : t("templates.confirmActivateTitle")}
            </DialogTitle>
            <DialogDescription>
              {getTemplateIsActive(toggleTarget)
                ? t("templates.confirmDeactivateDescription")
                : t("templates.confirmActivateDescription", {
                    type: t(getDocumentTypeLabelKey(getTemplateDocumentType(toggleTarget))),
                  })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setToggleTarget(null)}
              disabled={isMutating}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant={getTemplateIsActive(toggleTarget) ? "secondary" : "primary"}
              onClick={confirmToggle}
              isLoading={isMutating}
              loadingText={t("common.loading")}
            >
              {getTemplateIsActive(toggleTarget) ? t("templates.deactivate") : t("templates.activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isMutating) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("templates.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("templates.confirmDeleteDescription", {
                name: getTemplateName(deleteTarget),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isMutating}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
              isLoading={isMutating}
              loadingText={t("common.loading")}
            >
              {t("templates.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
