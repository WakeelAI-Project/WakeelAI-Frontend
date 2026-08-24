import React, { useEffect, useState, useCallback } from "react"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"
import { useToast } from "../components/ui/toast"
import {
  getLeaveRequests,
  updateLeaveRequest,
} from "../features/company/services/leave-service"
import { Table } from "../components/data-display/table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { SegmentedControl } from "../components/ui/segmented-control"
import { EmptyState } from "../components/layout/empty-state"
import { Pagination } from "../components/navigation/pagination"
import { Skeleton } from "../components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/overlay/dialog"
import { ExternalLink, Eye } from "lucide-react"
import { getImageUrl } from "../utils/get-image-url"
import { formatLocalDateOnly, formatLocalDateTime } from "../utils/date-format"

export function LeavePage({ readOnly = false }) {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const { toast } = useToast()

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Tab can be "Pending" or "Processed"
  const [activeTab, setActiveTab] = useState("Pending")
  // Sub-filter for Processed tab: "all", "Approved", "Rejected"
  const [processedFilter, setProcessedFilter] = useState("all")
  const [leaveRequests, setLeaveRequests] = useState([])

  // Modal / Action states
  const [pendingApprovalRequest, setPendingApprovalRequest] = useState(null)
  const [pendingRejectionRequest, setPendingRejectionRequest] = useState(null)
  const [rejectionNote, setRejectionNote] = useState("")
  const [rejectionError, setRejectionError] = useState("")
  const [activeAttachmentUrl, setActiveAttachmentUrl] = useState(null)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const PAGE_SIZE = 10

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Determine what status to query
      let statusQuery = activeTab === "Pending" ? "Pending" : processedFilter
      const response = await getLeaveRequests({
        status: statusQuery,
        page,
        limit: PAGE_SIZE,
      })

      // Backend returns pagination envelope
      let fetchedData = response?.data ?? []
      
      // If we queried "all" processed, filter out any Pending requests client-side
      if (activeTab === "Processed" && processedFilter === "all") {
        fetchedData = fetchedData.filter(item => item.status !== "Pending" && item.status !== "Draft" && item.status !== "Cancelled")
      }

      setLeaveRequests(fetchedData)
      setTotal(response?.total ?? fetchedData.length)
    } catch (err) {
      console.error("Failed to load leave requests:", err)
      setError(t("leave.loadErrorDesc"))
      setLeaveRequests([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [activeTab, processedFilter, page, t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTabChange = (val) => {
    setActiveTab(val)
    setPage(1)
  }

  const handleProcessedFilterChange = (val) => {
    setProcessedFilter(val)
    setPage(1)
  }

  const handleApproveConfirm = async () => {
    if (!pendingApprovalRequest) return
    setIsSubmittingAction(true)
    try {
      await updateLeaveRequest(pendingApprovalRequest.request_id, "Approved", "")
      toast({
        type: "success",
        message: t("leave.successApprove"),
      })
      setPendingApprovalRequest(null)
      loadData()
    } catch (err) {
      toast({
        type: "error",
        message: t("leave.approveFailed"),
        description: err?.response?.data?.message || err?.message || t("leave.actionFailed"),
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!pendingRejectionRequest) return
    if (!rejectionNote.trim()) {
      setRejectionError(t("leave.noteRequired"))
      return
    }
    setRejectionError("")
    setIsSubmittingAction(true)
    try {
      await updateLeaveRequest(pendingRejectionRequest.request_id, "Rejected", rejectionNote)
      toast({
        type: "success",
        message: t("leave.successReject"),
      })
      setPendingRejectionRequest(null)
      setRejectionNote("")
      loadData()
    } catch (err) {
      toast({
        type: "error",
        message: t("leave.rejectFailed"),
        description: err?.response?.data?.message || err?.message || t("leave.actionFailed"),
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // Get localized leave type name
  const getLeaveTypeLabel = (type) => {
    return t(`leave.${type.toLowerCase()}`, { defaultValue: type })
  }

  // Get status badge variant
  const getStatusVariant = (status) => {
    if (status === "Approved") return "success"
    if (status === "Rejected") return "error"
    return "info"
  }

  const getStatusLabel = (status) => {
    return t(`leave.${status.toLowerCase()}`, { defaultValue: status })
  }

  const columns = [
    { title: t("leave.employeeName"), key: "employee_name" },
    {
      title: t("leave.leaveType"),
      key: "leave_type",
      render: (val) => getLeaveTypeLabel(val)
    },
    {
      title: t("leave.startDate"),
      key: "start_date",
      render: (val) => formatLocalDateOnly(val, isRtl ? "ar-EG" : "en-US")
    },
    {
      title: t("leave.endDate"),
      key: "end_date",
      render: (val) => formatLocalDateOnly(val, isRtl ? "ar-EG" : "en-US")
    },
    {
      title: t("leave.duration"),
      key: "days_requested",
      isNumeric: true,
      render: (val) => val
    },
    {
      title: t("leave.status"),
      key: "status",
      render: (val) => (
        <Badge variant={getStatusVariant(val)} shape="pill">
          {getStatusLabel(val)}
        </Badge>
      )
    },
    {
      title: t("leave.submittedDate"),
      key: "submitted_at",
      render: (val) => formatLocalDateTime(val, isRtl ? "ar-EG" : "en-US")
    },
    ...(!readOnly ? [{
      title: t("leave.actions"),
      key: "actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.attachment_url && (
            <Button
              variant="secondary"
              size="xs"
              title={t("leave.viewAttachment")}
              onClick={() => setActiveAttachmentUrl(row.attachment_url)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          {row.status === "Pending" && (
            <>
              <Button
                variant="primary"
                size="xs"
                onClick={() => setPendingApprovalRequest(row)}
              >
                {t("leave.approve")}
              </Button>
              <Button
                variant="danger"
                size="xs"
                onClick={() => setPendingRejectionRequest(row)}
              >
                {t("leave.reject")}
              </Button>
            </>
          )}
        </div>
      )
    }] : [])
  ]

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <PageShell
      eyebrow={t("leave.timeOff")}
      title={readOnly ? t("leave.leaveOverviewTitle") : t("leave.leaveApprovals")}
      description={readOnly ? t("leave.readOnlyDescription") : t("leave.description")}
    >
      <div className="space-y-6">
        {/* Tab Selection & Sub-filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SegmentedControl
            options={[
              { value: "Pending", label: t("leave.pendingTab") },
              { value: "Processed", label: t("leave.processedTab") }
            ]}
            value={activeTab}
            onChange={handleTabChange}
            name="leave-tabs"
          />

          {activeTab === "Processed" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-(--text-secondary)">{t("leave.processedLabel")}:</span>
              <SegmentedControl
                options={[
                  { value: "all", label: t("leave.allProcessed") },
                  { value: "Approved", label: t("leave.approved") },
                  { value: "Rejected", label: t("leave.rejected") }
                ]}
                value={processedFilter}
                onChange={handleProcessedFilterChange}
                name="processed-filter"
                className="h-8"
              />
            </div>
          )}
        </div>

        {/* Content Table */}
        <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <EmptyState
              illustrationType="offline"
              title={t("leave.loadErrorTitle")}
              description={error}
              actionText={t("common.retry", { defaultValue: "Retry" })}
              onActionClick={loadData}
            />
          ) : leaveRequests.length === 0 ? (
            <EmptyState
              illustrationType="calendar"
              title={t("leave.noRequestsTitle")}
              description={t("leave.noRequestsDesc")}
            />
          ) : (
            <div className="space-y-4">
              <Table
                columns={columns}
                data={leaveRequests.map(item => ({ ...item, id: item.request_id }))}
              />

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-(--text-secondary)">
                    {t("leave.pageSummary", { page, totalPages })}
                  </span>
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
      </div>

      {/* Confirmation Dialog - Approve */}
      <Dialog
        open={!!pendingApprovalRequest}
        onOpenChange={(open) => !open && setPendingApprovalRequest(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("leave.approveConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("leave.approveConfirmDesc", { count: pendingApprovalRequest?.days_requested || 0 })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setPendingApprovalRequest(null)}
              disabled={isSubmittingAction}
            >
              {t("leave.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleApproveConfirm}
              isLoading={isSubmittingAction}
            >
              {t("leave.approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Reject */}
      <Dialog
        open={!!pendingRejectionRequest}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRejectionRequest(null)
            setRejectionNote("")
            setRejectionError("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("leave.rejectConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("leave.rejectConfirmDesc")}</DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <textarea
              className="w-full min-h-24 p-3 rounded-sm border border-(--border-default) bg-paper text-sm text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus)"
              placeholder={t("leave.reasonPlaceholder")}
              value={rejectionNote}
              onChange={(e) => {
                setRejectionNote(e.target.value)
                if (e.target.value.trim()) setRejectionError("")
              }}
              disabled={isSubmittingAction}
            />
            {rejectionError && (
              <p className="mt-1 text-xs text-(--status-error-fg)">{rejectionError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setPendingRejectionRequest(null)
                setRejectionNote("")
                setRejectionError("")
              }}
              disabled={isSubmittingAction}
            >
              {t("leave.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectConfirm}
              isLoading={isSubmittingAction}
            >
              {t("leave.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document / Medical Report Viewer Dialog */}
      <Dialog
        open={!!activeAttachmentUrl}
        onOpenChange={(open) => !open && setActiveAttachmentUrl(null)}
      >
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-6">
          <DialogHeader className="flex-none">
            <DialogTitle>{t("leave.attachment")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full min-h-0 bg-(--bg-page-alt) rounded-sm overflow-hidden border border-(--border-default) mt-4 relative">
            {activeAttachmentUrl?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={getImageUrl(activeAttachmentUrl)}
                title={t("leave.attachment")}
                className="w-full h-full border-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                <img
                  src={getImageUrl(activeAttachmentUrl)}
                  alt={t("leave.attachment")}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-none mt-4 flex justify-between items-center w-full">
            <a
              href={getImageUrl(activeAttachmentUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-(--brand-primary) hover:underline font-semibold"
            >
              <span>{t("leave.openInNewTab")}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Button variant="secondary" onClick={() => setActiveAttachmentUrl(null)}>
              {t("leave.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
