import React, { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DepartmentTable } from "../features/company/components/department-table"
import { DepartmentFormModal } from "../features/company/components/department-form-modal"
import { listDepartments, deleteDepartment } from "../features/company/services/department-service"
import { EmptyState } from "../components/layout/empty-state"
import { Pagination } from "../components/navigation/pagination"
import { Button } from "../components/ui/button"
import { Spinner } from "../components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/overlay/dialog"
import { useToast } from "../components/ui/toast"
import { PageShell } from "./page-shell"

const PAGE_SIZE = 50

export function DepartmentsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [departments, setDepartments] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0

  const loadDepartments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await listDepartments({ page, limit: PAGE_SIZE })
      setDepartments(response.data ?? [])
      setTotal(response.total ?? 0)
    } catch (err) {
      setDepartments([])
      setTotal(0)
      setError(err?.message || t("departmentsPage.loadError"))
    } finally {
      setLoading(false)
    }
  }, [page, t])

  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  const handleCreateSuccess = (result) => {
    if (result?.error) {
      toast({
        type: "error",
        message: t("common.error"),
        description: result.error.message,
      })
      return
    }
    setCreateOpen(false)
    loadDepartments()
    toast({
      type: "success",
      message: t("departmentsPage.createSuccess"),
    })
  }

  const handleEditSuccess = (result) => {
    if (result?.error) {
      toast({
        type: "error",
        message: t("common.error"),
        description: result.error.message,
      })
      return
    }
    setEditTarget(null)
    loadDepartments()
    toast({
      type: "success",
      message: t("departmentsPage.updateSuccess"),
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)

    try {
      await deleteDepartment(deleteTarget.department_id)
      setDeleteTarget(null)
      loadDepartments()
      toast({
        type: "success",
        message: t("departmentsPage.deleteSuccess"),
      })
    } catch (err) {
      toast({
        type: "error",
        message: t("common.error"),
        description: err?.message,
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <PageShell
      eyebrow={t("departmentsPage.eyebrow")}
      title={t("departmentsPage.title")}
      description={t("departmentsPage.description")}
    >
      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-(--text-secondary)">{t("departmentsPage.listHint")}</p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("departmentsPage.createButton")}
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center" role="status" aria-live="polite">
            <Spinner size="lg" />
            <span className="sr-only">{t("common.loading")}</span>
          </div>
        ) : error ? (
          <EmptyState
            illustrationType="offline"
            title={t("departmentsPage.loadError")}
            description={t("departmentsPage.loadErrorDescription")}
          />
        ) : departments.length === 0 ? (
          <EmptyState
            illustrationType="folder"
            title={t("departmentsPage.emptyTitle")}
            description={t("departmentsPage.emptyDescription")}
            actionText={t("departmentsPage.createButton")}
            onActionClick={() => setCreateOpen(true)}
          />
        ) : (
          <>
            <DepartmentTable
              departments={departments}
              onEdit={(row) => setEditTarget(row)}
              onDelete={(row) => setDeleteTarget(row)}
            />

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-(--text-secondary)">
                  {t("departmentsPage.pageSummary", { page, totalPages, total })}
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

      <DepartmentFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSuccess={handleCreateSuccess}
      />

      <DepartmentFormModal
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
        mode="edit"
        department={editTarget}
        onSuccess={handleEditSuccess}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("departmentsPage.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("departmentsPage.deleteConfirmDescription", {
                name: deleteTarget?.name ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
              isLoading={deleting}
              loadingText={t("common.loading")}
            >
              {t("departmentsPage.deleteConfirmAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
