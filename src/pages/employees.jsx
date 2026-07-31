import React, { useEffect, useState } from "react"
import { EmployeeCard } from "../components/legal/employee-card"
import { StatCard } from "../components/data-display/stat-card"
import { Table } from "../components/data-display/table"
import { getEmployees } from "../features/company/services/employee-service"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function EmployeesPage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    setFetchError(null)

    // Fetch all users; filter by role on the server if needed
    getEmployees({ page: 1, limit: 50 })
      .then((data) => {
        setEmployees(data)
      })
      .catch((err) => {
        setFetchError(err?.message || t("common.error"))
        setEmployees([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [t])

  const columns = [
    { title: t("employees.nameCol"), key: isRtl ? "name" : "nameEn", sortable: true },
    { title: t("employees.deptCol"), key: isRtl ? "department" : "departmentEn", sortable: true },
    { title: t("employees.salaryCol"), key: "salary", sortable: true, isNumeric: true }
  ]

  const activeCount = employees.filter((e) => e.isActive !== false).length

  return (
    <PageShell
      eyebrow={t("employees.peopleOps")}
      title={t("employees.title")}
      description={t("employees.description")}
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title={t("employees.active")}
          value={isLoading ? "—" : activeCount.toString()}
          domain="employee"
        />
        <StatCard title={t("employees.toRefresh")} value="0" domain="legal" />
        <StatCard title={t("employees.openLeave")} value="0" domain="leave" />
      </section>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-busy="true" aria-label={t("common.loading")}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-md animate-skeleton" />
          ))}
        </div>
      )}

      {/* Error banner */}
      {!isLoading && fetchError && (
        <div
          role="alert"
          className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)"
        >
          {fetchError}
        </div>
      )}

      {/* Employee list */}
      {!isLoading && !fetchError && employees.length > 0 && (
        <>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                name={isRtl ? employee.name : employee.nameEn}
                role={employee.role}
                department={isRtl ? employee.department : employee.departmentEn}
                status={employee.status}
                statusText={isRtl ? employee.statusText : employee.status}
                email={employee.email}
                phone={employee.phone}
                hireDate={employee.hireDate}
              />
            ))}
          </section>

          <Table columns={columns} data={employees} enableSelection />
        </>
      )}

      {/* Empty state */}
      {!isLoading && !fetchError && employees.length === 0 && (
        <p className="text-sm text-(--text-muted) text-center py-12">
          {t("employees.noEmployees", { defaultValue: "No employees found." })}
        </p>
      )}
    </PageShell>
  )
}
