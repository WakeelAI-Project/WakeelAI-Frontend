import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, CalendarClock, FileText, LockKeyhole, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DocumentPreview } from "../components/legal/document-preview"
import { EmptyState } from "../components/layout/empty-state"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"
import {
  getDocument,
  getDocumentId,
  isDocumentApiUnavailableError,
  finalizeDocument,
  sendDocumentEmail,
} from "../features/company/services/document-service"
import { useLocale } from "../hooks/use-locale"
import { PageShell } from "./page-shell"

function pick(document, keys) {
  for (const key of keys) {
    if (document?.[key] !== undefined && document?.[key] !== null && document?.[key] !== "") {
      return document[key]
    }
  }
  return null
}

function formatDate(value, locale) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function getLifecycleCopyKey(status) {
  const normalized = String(status || "").toLowerCase()
  if (normalized === "draft") return "documents.draftNotice"
  if (normalized === "finalized" || normalized === "approved") return "documents.finalizedNotice"
  return null
}

function getTitle(document, t) {
  return pick(document, ["title", "name", "filename"]) || t("documents.untitled")
}

function getType(document) {
  return pick(document, ["documentType", "document_type", "docType", "doc_type"])
}

function getEmployee(document) {
  return pick(document, ["employeeName", "employee_name", "employeeId", "employee_id"])
}

function getContent(document, t) {
  if (document?.pdfUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-(--bg-muted) p-4">
          <FileText className="h-8 w-8 text-(--legal-primary)" />
        </div>
        <div>
          <p className="font-medium text-(--text-primary)">{t("documents.finalizedPdfTitle", "Document Finalized")}</p>
          <p className="text-sm text-(--text-secondary)">{t("documents.finalizedPdfDesc", "This document is finalized and available as a PDF.")}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={document.pdfUrl} target="_blank" rel="noopener noreferrer">
            {t("documents.downloadPdf", "Download PDF")}
          </a>
        </Button>
      </div>
    )
  }
  return pick(document, ["contentHtml", "content_html", "content", "plainText", "plain_text", "body", "text"])
}

function isAiGeneratedDocument(document) {
  return pick(document, ["isAiGenerated", "is_ai_generated"]) ?? true
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null

  return (
    <div className="flex items-start justify-between gap-4 border-b border-(--border-default) py-3 text-sm last:border-b-0">
      <dt className="text-(--text-secondary)">{label}</dt>
      <dd className="max-w-[60%] break-words text-end font-medium text-(--text-primary)">
        {String(value)}
      </dd>
    </div>
  )
}

function MetadataPanel({ document, locale, t }) {
  const status = pick(document, ["status"])
  const rows = [
    [t("documents.fields.documentId"), getDocumentId(document)],
    [t("documents.fields.type"), getType(document)],
    [t("documents.fields.employee"), getEmployee(document)],
    [t("documents.fields.createdAt"), formatDate(pick(document, ["createdAt", "created_at", "date"]), locale)],
    [t("documents.fields.updatedAt"), formatDate(pick(document, ["updatedAt", "updated_at"]), locale)],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "")

  const metadata = document?.metadata && typeof document.metadata === "object"
    ? Object.entries(document.metadata).filter(([, value]) => (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    ))
    : []

  if (!status && rows.length === 0 && metadata.length === 0) return null

  return (
    <aside className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 shadow-(--shadow-1)">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-(--text-primary)">
          {t("documents.details")}
        </h3>
        {status && (
          <Badge variant={getStatusVariant(status)} shape="pill">
            {getStatusLabel(t, status)}
          </Badge>
        )}
      </div>

      {rows.length > 0 && (
        <dl className="rounded-sm border border-(--border-default) px-3">
          {rows.map(([label, value]) => (
            <DetailRow key={label} label={label} value={value} />
          ))}
        </dl>
      )}

      {metadata.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold uppercase text-(--text-secondary)">
            {t("documents.metadata")}
          </h4>
          <dl className="rounded-sm border border-(--border-default) px-3">
            {metadata.map(([label, value]) => (
              <DetailRow key={label} label={label} value={value} />
            ))}
          </dl>
        </div>
      )}
    </aside>
  )
}

function ReviewLoading() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Skeleton className="min-h-150 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

function getErrorCopy(t, error) {
  if (isDocumentApiUnavailableError(error)) {
    return {
      title: t("documents.reviewPendingTitle"),
      description: t("documents.reviewPendingDescription"),
      actionText: t("documents.backToDocuments"),
      canRetry: false,
    }
  }

  if (error?.code === "validation_error") {
    return {
      title: t("documents.invalidDocumentTitle"),
      description: t("documents.invalidDocumentDescription"),
      actionText: t("documents.backToDocuments"),
      canRetry: false,
    }
  }

  if (error?.status === 401) {
    return {
      title: t("documents.unauthorizedTitle"),
      description: t("documents.unauthorizedDescription"),
      actionText: t("common.retry"),
      canRetry: true,
    }
  }

  if (error?.status === 403) {
    return {
      title: t("documents.forbiddenTitle"),
      description: t("documents.forbiddenDescription"),
      actionText: t("documents.backToDocuments"),
      canRetry: false,
    }
  }

  if (error?.status === 404) {
    return {
      title: t("documents.notFoundTitle"),
      description: t("documents.notFoundDescription"),
      actionText: t("documents.backToDocuments"),
      canRetry: false,
    }
  }

  return {
    title: t("documents.loadErrorTitle"),
    description: t("documents.loadErrorDescription"),
    actionText: t("common.retry"),
    canRetry: true,
  }
}

export function DocumentReviewPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const locale = isRtl ? "ar-EG" : "en-US"

  const loadDocument = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getDocument(documentId)
      setDocument(data)
    } catch (err) {
      setDocument(null)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    loadDocument()
  }, [loadDocument])

  const handleFinalize = async () => {
    if (!window.confirm(t("documents.confirmFinalize", "Are you sure you want to finalize this document? This cannot be undone."))) {
      return
    }
    setActionLoading(true)
    try {
      await finalizeDocument(documentId)
      await loadDocument()
    } catch (err) {
      alert(t("documents.finalizeError", "Failed to finalize document. " + (err.message || "")))
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendEmail = async () => {
    const email = window.prompt(t("documents.promptEmail", "Enter email address to send to (leave empty to use employee's email if available):"))
    // prompt returns null if cancelled
    if (email === null) return
    
    setActionLoading(true)
    try {
      await sendDocumentEmail(documentId, email.trim() || null)
      alert(t("documents.emailSentSuccess", "Email sent successfully!"))
      await loadDocument()
    } catch (err) {
      alert(t("documents.emailSendError", "Failed to send email. " + (err.message || "")))
    } finally {
      setActionLoading(false)
    }
  }

  const status = pick(document, ["status"])
  const lifecycleCopyKey = getLifecycleCopyKey(status)
  const errorCopy = useMemo(() => error ? getErrorCopy(t, error) : null, [error, t])

  return (
    <PageShell
      eyebrow={t("documents.reviewEyebrow")}
      title={document ? getTitle(document, t) : t("documents.reviewTitle")}
      description={t("documents.reviewDescription")}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/hr/documents")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t("documents.backToDocuments")}
        </Button>
      </div>

      {loading ? (
        <ReviewLoading />
      ) : error ? (
        <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 shadow-(--shadow-1)">
          <EmptyState
            illustrationType={isDocumentApiUnavailableError(error) ? "document" : "offline"}
            title={errorCopy.title}
            description={errorCopy.description}
            actionText={errorCopy.actionText}
            onActionClick={errorCopy.canRetry ? loadDocument : () => navigate("/hr/documents")}
          />
        </section>
      ) : document ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="min-w-0">
            {lifecycleCopyKey && (
              <div className="mb-4 rounded-md border border-(--border-default) bg-(--bg-card) p-4 text-start shadow-(--shadow-1)">
                <div className="flex items-start gap-3">
                  {String(status).toLowerCase() === "draft" ? (
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-(--status-warning-fg)" />
                  ) : (
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-(--status-success-fg)" />
                  )}
                  <p className="text-sm leading-relaxed text-(--text-secondary)">
                    {t(lifecycleCopyKey)}
                  </p>
                </div>
              </div>
            )}

            <DocumentPreview
              title={getTitle(document, t)}
              content={getContent(document, t)}
              isAiGenerated={isAiGeneratedDocument(document)}
              showCitationFooter={false}
            />
          </section>

          <div className="space-y-5">
            <MetadataPanel document={document} locale={locale} t={t} />

            <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
              <div className="mb-3 flex items-center gap-2 text-(--text-primary)">
                <FileText className="h-4 w-4 text-(--legal-primary)" aria-hidden="true" />
                <h3 className="text-sm font-semibold">{t("documents.reviewActions")}</h3>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {String(status).toLowerCase() === "draft" && (
                  <Button 
                    type="button" 
                    variant="primary" 
                    className="w-full justify-center"
                    onClick={handleFinalize}
                    disabled={actionLoading}
                  >
                    {actionLoading ? t("common.loading", "Loading...") : t("documents.actionFinalize", "Finalize Document")}
                  </Button>
                )}
                {String(status).toLowerCase() === "finalized" && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={handleSendEmail}
                    disabled={actionLoading}
                  >
                    {actionLoading ? t("common.loading", "Loading...") : t("documents.actionSendEmail", "Send Email")}
                  </Button>
                )}
                {String(status).toLowerCase() !== "draft" && String(status).toLowerCase() !== "finalized" && (
                   <p className="text-sm leading-relaxed text-(--text-secondary)">
                     {t("documents.noReviewActions")}
                   </p>
                )}
              </div>
            </section>

            {getEmployee(document) && (
              <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
                <div className="mb-3 flex items-center gap-2 text-(--text-primary)">
                  <UserRound className="h-4 w-4 text-(--legal-primary)" aria-hidden="true" />
                  <h3 className="text-sm font-semibold">{t("documents.employeeContext")}</h3>
                </div>
                <p className="break-words text-sm text-(--text-secondary)">
                  {getEmployee(document)}
                </p>
              </section>
            )}
          </div>
        </div>
      ) : (
        <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 shadow-(--shadow-1)">
          <EmptyState
            illustrationType="document"
            title={t("documents.notFoundTitle")}
            description={t("documents.notFoundDescription")}
            actionText={t("documents.backToDocuments")}
            onActionClick={() => navigate("/hr/documents")}
          />
        </section>
      )}
    </PageShell>
  )
}
