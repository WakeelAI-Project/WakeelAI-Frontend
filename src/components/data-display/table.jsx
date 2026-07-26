import React, { useState } from "react"
import { ChevronDown, ChevronRight, ArrowUpDown, MoreVertical } from "lucide-react"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export function Table({
  columns = [],
  data = [],
  onRowClick,
  enableSelection = false,
  onSelectionChange,
  expandableRowRender,
  className
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [expandedRows, setExpandedRows] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  // Selection handlers
  const handleSelectAll = (checked) => {
    const ids = checked ? sortedData.map((row) => row.id || row.key) : []
    setSelectedIds(ids)
    if (onSelectionChange) onSelectionChange(ids)
  }

  const handleSelectRow = (id, checked) => {
    const newSelected = checked
      ? [...selectedIds, id]
      : selectedIds.filter((item) => item !== id)
    setSelectedIds(newSelected)
    if (onSelectionChange) onSelectionChange(newSelected)
  }

  // Row expansion handlers
  const toggleRowExpand = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className={cn("w-full overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-default)] dark:border-[var(--stone-800)] bg-[var(--stone-0)] dark:bg-[var(--stone-900)]", className)}>
      <table className="w-full border-collapse text-sm text-start select-none">
        <thead className="bg-[var(--stone-50)] dark:bg-[var(--stone-950)] border-b border-[var(--border-default)] dark:border-[var(--stone-800)]">
          <tr>
            {/* Expand indicator column */}
            {expandableRowRender && <th className="w-10 px-4 py-3" />}

            {/* Selection Checkbox */}
            {enableSelection && (
              <th className="w-10 px-4 py-3 text-start">
                <Checkbox
                  checked={selectedIds.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
            )}

            {/* Content headers */}
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={cn(
                  "px-4 py-3 font-semibold text-[var(--text-secondary)] text-start",
                  col.sortable && "cursor-pointer hover:text-[var(--text-primary)]",
                  col.isNumeric && "text-end font-mono"
                )}
              >
                <div className={cn("flex items-center gap-1.5", col.isNumeric && "justify-end")}>
                  <span>{col.title}</span>
                  {col.sortable && <ArrowUpDown className="h-3.5 w-3.5 opacity-55" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-default)] dark:divide-[var(--stone-800)]">
          {sortedData.map((row, idx) => {
            const rowId = row.id || idx
            const isSelected = selectedIds.includes(rowId)
            const isExpanded = expandedRows.includes(rowId)

            return (
              <React.Fragment key={rowId}>
                <tr
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "hover:bg-[var(--stone-50)] dark:hover:bg-[var(--stone-850)] transition-colors",
                    isSelected && "bg-[var(--ochre-25)]/40 hover:bg-[var(--ochre-25)]/60 dark:bg-[var(--ochre-900)]/10"
                  )}
                >
                  {/* Expand cell */}
                  {expandableRowRender && (
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRowExpand(rowId)
                        }}
                        className="p-1 hover:bg-[var(--stone-100)] rounded-full dark:hover:bg-[var(--stone-800)] cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 opacity-75" />
                        ) : (
                          <ChevronRight className="h-4 w-4 opacity-75 rtl:rotate-180" />
                        )}
                      </button>
                    </td>
                  )}

                  {/* Checkbox cell */}
                  {enableSelection && (
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(rowId, checked)}
                      />
                    </td>
                  )}

                  {/* Value cells */}
                  {columns.map((col) => {
                    const cellValue = row[col.key]
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3.5 text-[var(--text-primary)] text-start align-middle",
                          col.isNumeric && "text-end font-mono tracking-tight text-xs"
                        )}
                      >
                        {col.render ? col.render(cellValue, row) : cellValue}
                      </td>
                    )
                  })}
                </tr>

                {/* Expanded content row */}
                {expandableRowRender && isExpanded && (
                  <tr className="bg-[var(--stone-25)] dark:bg-[var(--stone-950)]">
                    <td
                      colSpan={columns.length + (enableSelection ? 2 : 1)}
                      className="px-8 py-4 border-t border-[var(--border-default)] dark:border-[var(--stone-800)] text-start"
                    >
                      {expandableRowRender(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
