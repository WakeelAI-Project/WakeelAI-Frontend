import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react"
import { useNavigate } from "react-router"
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
  const navigate = useNavigate()
  const { currentUser } = useApp()

  // ── Backend-driven state ─────────────────────────────────────────────────
  // allEmployees holds the raw list returned by the backend for the current
  // status filter and page. Search never triggers a new API call.
  const [allEmployees, setAllEmployees] = useState([])
  const [backendTotal, setBackendTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState("all")
  const [backendPage, setBackendPage] = useState(1)

  // ── Client-side search state ─────────────────────────────────────────────
  // searchQuery drives the local filter; useDeferredValue keeps the UI
  // responsive while the (synchronous) filter runs.
  const [searchQuery, setSearchQuery] = useState("")
  const [searchPage, setSearchPage] = useState(1)
  const deferredSearchQuery = useDeferredValue(searchQuery)

  // ── UI state ─────────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  // ── Derived: client-side search ──────────────────────────────────────────
  // filteredEmployees is computed from allEmployees without any API call.
  // Runs only when allEmployees or deferredSearchQuery changes.
  const filteredEmployees = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase()
    if (!q) return allEmployees

    return allEmployees.filter((emp) => {
      const name   = (emp.full_name         ?? "").toLowerCase()
      const job    = (emp.job_title         ?? "").toLowerCase()
      const dept   = (emp.department        ?? "").toLowerCase()
      const status = (emp.employment_status ?? "").toLowerCase()
      return (
        name.includes(q)   ||
        job.includes(q)    ||
        dept.includes(q)   ||
        status.includes(q)
      )
    })
  }, [allEmployees, deferredSearchQuery])

  // ── Derived: pagination ──────────────────────────────────────────────────
  // When searching: paginate the filtered list on the frontend.
  // When not searching: use the backend's total for the page count.
  const isSearchActive = deferredSearchQuery.trim().length > 0

  const displayedPage  = isSearchActive ? searchPage  : backendPage
  const displayedTotal = isSearchActive ? filteredEmployees.length : backendTotal
  const totalPages     = displayedTotal > 0 ? Math.ceil(displayedTotal / PAGE_SIZE) : 0

  const pagedEmployees = useMemo(() => {
    if (!isSearchActive) return filteredEmployees        // already paged by backend
    const start = (searchPage - 1) * PAGE_SIZE
    return filteredEmployees.slice(start, start + PAGE_SIZE)
  }, [filteredEmployees, isSearchActive, searchPage])

  // ── Data fetching ────────────────────────────────────────────────────────
  // Only fires when statusFilter or backendPage changes — never on search.
  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await listEmployees({
        page:   backendPage,
        limit:  PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
      })

      setAllEmployees(response.data  ?? [])
      setBackendTotal(response.total ?? 0)
    } catch {
      setAllEmployees([])
      setBackendTotal(0)
      setError(t("employees.loadError"))
    } finally {
      setLoading(false)
    }
  }, [backendPage, statusFilter, t])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  // ── Departments (for modals) ─────────────────────────────────────────────
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
    return () => { ignore = true }
  }, [t, toast])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStatusChange = (value) => {
    startTransition(() => {
      setStatusFilter(value)
      setBackendPage(1)
      // Reset search pagination too so results start from page 1
      setSearchPage(1)
    })
  }

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value
    startTransition(() => {
      setSearchQuery(value)
      setSearchPage(1)   // always restart filtered pagination from page 1
    })
  }, [])

  const handlePageChange = useCallback((newPage) => {
    if (isSearchActive) {
      setSearchPage(newPage)
    } else {
      setBackendPage(newPage)
    }
  }, [isSearchActive])

  const handleDeactivate = useCallback(async (employee) => {
    setDeleting(true)
    try {
      await deactivateEmployee(employee.record_id)
      loadEmployees()
      toast({ type: "success", message: t("employees.deactivateSuccess") })
    } catch (err) {
      toast({ type: "error", message: t("common.error"), description: err?.message })
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
      toast({ type: "error", message: t("common.error"), description: err?.message })
    } finally {
      setEditLoading(false)
    }
  }, [toast, t])

  const handleCreateSuccess = (result) => {
    if (result?.error) {
      toast({ type: "error", message: t("common.error"), description: result.error.message })
      return
    }
    setCreateOpen(false)
    loadEmployees()
    toast({ type: "success", message: t("employees.createSuccess") })
  }

  const handleEditSuccess = (result) => {
    if (result?.error) {
      toast({ type: "error", message: t("common.error"), description: result.error.message })
      return
    }
    setEditTarget(null)
    loadEmployees()
    toast({ type: "success", message: t("employees.updateSuccess") })
  }

  const handleAskAI = useCallback((row) => {
    navigate("/assistant", {
      state: {
        targetEmployeeId: row.record_id,
        targetEmployeeName: row.full_name
      }
    })
  }, [navigate])

  // ── Render ────────────────────────────────────────────────────────────────
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
        ) : pagedEmployees.length === 0 ? (
          <EmptyState
            illustrationType="folder"
            title={t("employees.emptyTitle")}
            description={t("employees.emptyDescription")}
          />
        ) : (
          <>
            <EmployeeTable
              employees={pagedEmployees}
              onEdit={handleEditClick}
              onDeactivate={handleDeactivate}
              onAskAI={handleAskAI}
              canAskAI={currentUser?.role === 'HR_Manager'}
              editLoading={editLoading}
              deactivating={deleting}
            />

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-(--text-secondary)">
                  {t("employees.pageSummary", { page: displayedPage, totalPages, total: displayedTotal })}
                </p>
                <Pagination
                  currentPage={displayedPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
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
