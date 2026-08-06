import React, { useCallback, useDeferredValue, useEffect, useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { EmployeeTable } from "../features/company/components/employee-table"
import { EmployeeFormModal } from "../features/company/components/employee-form-modal"
import { listEmployees, getEmployee, deactivateEmployee } from "../features/company/services/employee-service"
import { listDepartments } from "../features/company/services/department-service"
import { EmptyState } from "../components/layout/empty-state"
import { Pagination } from "../components/navigation/pagination"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Spinner } from "../components/ui/spinner"
import { useToast } from "../components/ui/toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { PageShell } from "./page-shell"

const PAGE_SIZE = 20

export function EmployeesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const deferredSearchQuery = useDeferredValue(searchQuery)

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await listEmployees({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: deferredSearchQuery || undefined,
      })

      setEmployees(response.data ?? [])
      setTotal(response.total ?? 0)
    } catch {
      setEmployees([])
      setTotal(0)
      setError(t("employees.loadError"))
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, deferredSearchQuery, t])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  useEffect(() => {
    let ignore = false

    async function loadDepartments() {
      try {
        const response = await listDepartments()
        if (!ignore) setDepartments(response.data ?? [])
      } catch (err) {
        if (!ignore) {
          toast({
            type: "error",
            message: t("departmentsPage.loadError"),
            description: err?.message,
          })
        }
      }
    }

    loadDepartments()

    return () => {
      ignore = true
    }
  }, [t, toast])

  const handleStatusChange = (value) => {
    startTransition(() => {
      setStatusFilter(value)
      setPage(1)
    })
  }

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value
    startTransition(() => {
      setSearchQuery(value)
      setPage(1)
    })
  }, [])

  const handleDeactivate = useCallback(async (employee) => {
    setDeleting(true)
    try {
      await deactivateEmployee(employee.record_id)
      loadEmployees()
      toast({
        type: "success",
        message: t("employees.deactivateSuccess"),
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
  }, [loadEmployees, toast, t])

  const handleEditClick = useCallback(async (row) => {
    setEditLoading(true)
    try {
      const detail = await getEmployee(row.record_id)
      setEditTarget(detail)
    } catch (err) {
      toast({
        type: "error",
        message: t("common.error"),
        description: err?.message,
      })
    } finally {
      setEditLoading(false)
    }
  }, [toast, t])

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
    loadEmployees()
    toast({
      type: "success",
      message: t("employees.createSuccess"),
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
    loadEmployees()
    toast({
      type: "success",
      message: t("employees.updateSuccess"),
    })
  }

  return (
    <PageShell
      eyebrow={t("employees.peopleOps")}
      title={t("employees.title")}
      description={t("employees.listDescription")}
    >
      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <Input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t("employees.searchPlaceholder")}
              aria-label={t("employees.searchPlaceholder")}
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
                {t("employees.statusFilter")}
              </label>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger aria-label={t("employees.statusFilter")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("employees.statusAll")}</SelectItem>
                  <SelectItem value="Active">{t("employees.statusActive")}</SelectItem>
                  <SelectItem value="Inactive">{t("employees.statusInactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("employees.createButton")}
            </Button>
          </div>
        </div>

        {loading || isPending ? (
          <div className="flex min-h-48 items-center justify-center" role="status" aria-live="polite">
            <Spinner size="lg" />
            <span className="sr-only">{t("common.loading")}</span>
          </div>
        ) : error ? (
          <EmptyState
            illustrationType="offline"
            title={t("employees.loadError")}
            description={t("employees.loadErrorDescription")}
          />
        ) : employees.length === 0 ? (
          <EmptyState
            illustrationType="folder"
            title={t("employees.emptyTitle")}
            description={t("employees.emptyDescription")}
          />
        ) : (
          <>
            <EmployeeTable 
              employees={employees} 
              onEdit={handleEditClick}
              onDeactivate={handleDeactivate}
              editLoading={editLoading}
              deactivating={deleting}
            />

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-(--text-secondary)">
                  {t("employees.pageSummary", { page, totalPages, total })}
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

      <EmployeeFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        departments={departments}
        onSuccess={handleCreateSuccess}
      />

      <EmployeeFormModal
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
        mode="edit"
        employee={editTarget}
        departments={departments}
        onSuccess={handleEditSuccess}
      />
    </PageShell>
  )
}
