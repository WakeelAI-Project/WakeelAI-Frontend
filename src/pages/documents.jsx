import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Eye, FileText, LockKeyhole } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Table } from "../components/data-display/table"
import { EmptyState } from "../components/layout/empty-state"
import { Pagination } from "../components/navigation/pagination"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"
import {
  DOCUMENT_BACKEND_STATUS,
  getDocumentId,
  getDocuments,
} from "../features/company/services/document-service"
import { useLocale } from "../hooks/use-locale"
import { PageShell } from "./page-shell"

const PAGE_SIZE = 20

function formatDate(value, locale) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getStatusVariant(status) {
  const normalized = String(status || "").toLowerCase()
  if (normalized === "draft") return "warning"
  if (normalized === "finalized" || normalized === "approved") return "success"
  if (normalized === "rejected") return "error"
  return "info"
}

function getStatusLabel(t, status) {
  if (!status) return t("common.unknown")
  const key = String(status).toLowerCase()
  return t(`documents.status.${key}`, { defaultValue: status })
}

function getDocumentTitle(document, t) {
  return document.title ?? document.name ?? document.filename ?? t("documents.untitled")
}

function getDocumentType(document) {
  return document.documentType ?? document.document_type ?? document.docType ?? document.doc_type ?? "-"
}

function getEmployeeLabel(document) {
  return (
    document.employeeName ??
    document.employee_name ??
    document.employeeId ??
    document.employee_id ??
    "-"
  )
}

function getCreatedAt(document) {
  return document.createdAt ?? document.created_at ?? document.date ?? null
}

function DocumentsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export function DocumentsPage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [backendStatus, setBackendStatus] = useState(DOCUMENT_BACKEND_STATUS.READY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const locale = isRtl ? "ar-EG" : "en-US"
  const isPendingBackend = backendStatus === DOCUMENT_BACKEND_STATUS.PENDING_BACKEND_CONTRACT
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getDocuments({ page, limit: PAGE_SIZE })
      setDocuments(response?.data ?? [])
      setTotal(response?.total ?? 0)
      setBackendStatus(response?.status ?? DOCUMENT_BACKEND_STATUS.READY)
    } catch (err) {
      setDocuments([])
      setTotal(0)
      setBackendStatus(DOCUMENT_BACKEND_STATUS.READY)
      setError(err?.message || t("documents.loadErrorDescription"))
    } finally {
      setLoading(false)
    }
  }, [page, t])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const openDocument = useCallback((document) => {
    const documentId = getDocumentId(document)
    if (!documentId) return

    navigate(`/hr/documents/${encodeURIComponent(String(documentId))}`)
  }, [navigate])

  const columns = useMemo(() => [
    {
      title: t("documents.columns.title"),
      key: "title",
      render: (_value, row) => (
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-(--legal-primary)" />
          <span className="truncate font-medium">{getDocumentTitle(row, t)}</span>
        </div>
      ),
    },
    {
      title: t("documents.columns.type"),
      key: "documentType",
      render: (_value, row) => getDocumentType(row),
    },
    {
      title: t("documents.columns.employee"),
      key: "employee",
      render: (_value, row) => getEmployeeLabel(row),
    },
    {
      title: t("documents.columns.status"),
      key: "status",
      render: (value) => (
        <Badge variant={getStatusVariant(value)} shape="pill">
          {getStatusLabel(t, value)}
        </Badge>
      ),
    },
    {
      title: t("documents.columns.created"),
      key: "createdAt",
      render: (_value, row) => formatDate(getCreatedAt(row), locale),
    },
    {
      title: t("documents.columns.actions"),
      key: "actions",
      render: (_value, row) => {
        const canOpen = Boolean(getDocumentId(row))

        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canOpen}
            onClick={(event) => {
              event.stopPropagation()
              openDocument(row)
            }}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            {t("documents.reviewAction")}
          </Button>
        )
      },
    },
  ], [locale, openDocument, t])

  return (
    <PageShell
      eyebrow={t("documents.vault")}
      title={t("documents.title")}
      description={t("documents.description")}
    >
      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-(--text-secondary)">
            {isPendingBackend ? t("documents.backendPendingHint") : t("documents.listHint")}
          </p>
          {isPendingBackend && (
            <Badge variant="warning" shape="pill" className="w-fit">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
              {t("documents.backendPendingBadge")}
            </Badge>
          )}
        </div>

        {loading ? (
          <DocumentsLoading />
        ) : error ? (
          <EmptyState
            illustrationType="offline"
            title={t("documents.loadErrorTitle")}
            description={error}
            actionText={t("common.retry")}
            onActionClick={loadDocuments}
          />
        ) : isPendingBackend ? (
          <EmptyState
            illustrationType="document"
            title={t("documents.backendPendingTitle")}
            description={t("documents.backendPendingDescription")}
          />
        ) : documents.length === 0 ? (
          <EmptyState
            illustrationType="document"
            title={t("documents.emptyTitle")}
            description={t("documents.emptyDescription")}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={documents.map((document) => ({
                ...document,
                id: getDocumentId(document),
              }))}
              onRowClick={openDocument}
            />

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-(--text-secondary)">
                  {t("documents.pageSummary", { page, totalPages, total })}
                </p>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </PageShell>
  )
}
