import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { EmployeeTable } from "../features/company/components/employee-table"
import { listEmployees } from "../features/company/services/employee-service"
import { EmptyState } from "../components/layout/empty-state"
import { Pagination } from "../components/navigation/pagination"
import { Input } from "../components/ui/input"
import { Spinner } from "../components/ui/spinner"
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
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await listEmployees({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
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
  }, [page, statusFilter, t])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setPage(1)
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
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("employees.searchPlaceholder")}
              aria-label={t("employees.searchPlaceholder")}
            />
          </div>

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
        </div>

        {loading ? (
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
            <EmployeeTable employees={employees} />

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
    </PageShell>
  )
}
