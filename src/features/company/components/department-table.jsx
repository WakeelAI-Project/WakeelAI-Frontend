import React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Table } from "../../../components/data-display/table"
import { Button } from "../../../components/ui/button"

function formatCreatedDate(iso) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

export function DepartmentTable({ departments = [], onEdit, onDelete }) {
  const { t } = useTranslation()

  const columns = [
    { title: t("departmentsPage.nameCol"), key: "name" },
    {
      title: t("departmentsPage.descriptionCol"),
      key: "description",
      render: (value) => value || "—",
    },
    {
      title: t("departmentsPage.createdCol"),
      key: "createdAt",
      render: (value) => formatCreatedDate(value),
    },
    {
      title: t("departmentsPage.actionsCol"),
      key: "actions",
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(row)}
            aria-label={t("departmentsPage.editAction", { name: row.name })}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {t("departmentsPage.editActionShort")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-(--status-error-fg) hover:text-(--status-error-fg)"
            onClick={() => onDelete?.(row)}
            aria-label={t("departmentsPage.deleteAction", { name: row.name })}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("departmentsPage.deleteActionShort")}
          </Button>
        </div>
      ),
    },
  ]

  const rows = departments

  return <Table columns={columns} data={rows} />
}
