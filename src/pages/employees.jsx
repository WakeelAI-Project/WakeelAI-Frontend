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

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => setEmployees([]))
  }, [])

  const columns = [
    { title: t("employees.nameCol"), key: isRtl ? "name" : "nameEn", sortable: true },
    { title: t("employees.deptCol"), key: isRtl ? "department" : "departmentEn", sortable: true },
    { title: t("employees.salaryCol"), key: "salary", sortable: true, isNumeric: true }
  ]

  return (
    <PageShell
      eyebrow={t("employees.peopleOps")}
      title={t("employees.title")}
      description={t("employees.description")}
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title={t("employees.active")} value={employees.length.toString()} domain="employee" />
        <StatCard title={t("employees.toRefresh")} value="0" domain="legal" />
        <StatCard title={t("employees.openLeave")} value="0" domain="leave" />
      </section>

      {employees.length > 0 && (
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
    </PageShell>
  )
}
