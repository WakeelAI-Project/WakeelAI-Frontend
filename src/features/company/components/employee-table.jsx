import React from "react"
import { Pencil } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Table } from "../../../components/data-display/table"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"

function statusVariant(status) {
  if (status === "Active") return "success"
  if (status === "Inactive") return "warning"
  return "employee"
}

export function EmployeeTable({ employees = [], onEdit = () => {} }) {
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
    {
      title: t("employees.actionsCol"),
      key: "actions",
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            aria-label={t("employees.editAction", { name: row.full_name })}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {t("employees.editActionShort")}
          </Button>
        </div>
      ),
    },
  ]

  const rows = employees.map((employee) => ({
    ...employee,
    id: employee.record_id,
  }))

  return <Table columns={columns} data={rows} />
}
