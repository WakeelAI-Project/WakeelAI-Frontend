import React from "react"
import { EmployeeCard } from "../components/legal/employee-card"
import { StatCard } from "../components/data-display/stat-card"
import { Table } from "../components/data-display/table"
import { employees } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"

export function EmployeesPage({ isRtl }) {
  const columns = [
    { title: isRtl ? "الاسم" : "Name", key: isRtl ? "name" : "nameEn", sortable: true },
    { title: isRtl ? "القسم" : "Department", key: isRtl ? "department" : "departmentEn", sortable: true },
    { title: isRtl ? "الراتب" : "Salary", key: "salary", sortable: true, isNumeric: true }
  ]

  return (
    <PageShell
      isRtl={isRtl}
      eyebrow="People Operations"
      eyebrowAr="الموارد البشرية"
      title="Employees"
      titleAr="الموظفون"
      description="A focused view for employee records, pay context, and compliance-sensitive profile data."
      descriptionAr="عرض تشغيلي لملفات الموظفين والرواتب والبيانات المرتبطة بالامتثال."
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title={isRtl ? "الموظفون النشطون" : "Active employees"} value="128" domain="employee" trend={{ value: 8, isPositive: true }} />
        <StatCard title={isRtl ? "عقود تحتاج تحديثا" : "Contracts to refresh"} value="14" domain="legal" />
        <StatCard title={isRtl ? "طلبات إجازة مفتوحة" : "Open leave requests"} value="6" domain="leave" />
      </section>

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
    </PageShell>
  )
}
