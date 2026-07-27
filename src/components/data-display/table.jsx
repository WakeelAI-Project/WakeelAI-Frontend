import React, { useState } from "react"
import { ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react"
import { Checkbox } from "../ui/checkbox"
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
    <div className={cn("w-full overflow-x-auto rounded-md border border-(--border-default) dark:border-(--bg-card-raised) bg-paper dark:bg-(--bg-card)", className)}>
      <table className="w-full border-collapse text-sm text-start select-none">
        <thead className="bg-(--bg-card-raised) dark:bg-(--bg-page-alt) border-b border-(--border-default) dark:border-(--bg-card-raised)">
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
                  "px-4 py-3 font-semibold text-(--text-secondary) text-start",
                  col.sortable && "cursor-pointer hover:text-(--text-primary)",
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
        <tbody className="divide-y divide-(--border-default) dark:divide-(--bg-card-raised)">
          {sortedData.map((row, idx) => {
            const rowId = row.id || idx
            const isSelected = selectedIds.includes(rowId)
            const isExpanded = expandedRows.includes(rowId)

            return (
              <React.Fragment key={rowId}>
                <tr
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "hover:bg-(--bg-card-raised) dark:hover:bg-(--bg-card-raised) transition-colors",
                    isSelected && "bg-(--accent-surface)/40 hover:bg-(--accent-surface)/60 dark:bg-(--accent-primary-active)/10"
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
                        className="p-1 hover:bg-(--bg-page-alt) rounded-full dark:hover:bg-(--bg-card-raised) cursor-pointer"
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
                          "px-4 py-3.5 text-(--text-primary) text-start align-middle",
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
                  <tr className="bg-(--bg-card-subtle) dark:bg-(--bg-page-alt)">
                    <td
                      colSpan={columns.length + (enableSelection ? 2 : 1)}
                      className="px-8 py-4 border-t border-(--border-default) dark:border-(--bg-card-raised) text-start"
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
