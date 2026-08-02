import React from "react"
import { useTranslation } from "react-i18next"
import { Table } from "../../../components/data-display/table"
import { Badge } from "../../../components/ui/badge"

function statusVariant(status) {
  if (status === "Active") return "success"
  if (status === "Inactive") return "warning"
  return "employee"
}

export function EmployeeTable({ employees = [] }) {
  const { t } = useTranslation()

  const columns = [
    { title: t("employees.nameCol"), key: "full_name" },
    { title: t("employees.jobTitleCol"), key: "job_title" },
    { title: t("employees.deptCol"), key: "department" },
    {
      title: t("employees.statusCol"),
      key: "employment_status",
      render: (value) => (
        <Badge variant={statusVariant(value)} shape="pill">
          {value}
        </Badge>
      ),
    },
  ]

  const rows = employees.map((employee) => ({
    ...employee,
    id: employee.record_id,
  }))

  return <Table columns={columns} data={rows} />
}
