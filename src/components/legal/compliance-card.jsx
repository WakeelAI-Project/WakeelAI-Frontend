import React from "react"
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

export function ComplianceCard({
  title,
  articleNumber,
  status = "compliant", // compliant, warning, non-compliant
  statusText,
  description,
  date,
  className
}) {
  const statusColors = {
    compliant: "border-inline-start-(--status-success-fg) bg-(--status-success-bg) text-(--status-success-fg) border-(--border-default)",
    warning: "border-inline-start-(--status-warning-fg) bg-(--status-warning-bg) text-(--status-warning-fg) border-(--border-default)",
    "non-compliant": "border-inline-start-(--status-error-fg) bg-(--status-error-bg) text-(--status-error-fg) border-(--border-default)"
  }

  const icons = {
    compliant: ShieldCheck,
    warning: ShieldAlert,
    "non-compliant": ShieldX
  }

  const Icon = icons[status]

  return (
    <div
      className={cn(
        "rounded-md border-y border-e border-inline-start-4 bg-(--bg-card) p-5 flex flex-col justify-between gap-4 dark:bg-(--bg-card) text-start shadow-sm",
        statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="p-2 rounded-sm bg-(--bg-card-raised) text-(--text-secondary) shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-(--text-secondary) font-mono font-medium">
              {articleNumber}
            </span>
            <span className="font-semibold text-sm text-(--text-primary) mt-0.5">
              {title}
            </span>
          </div>
        </div>
        <Badge
          variant={status === "compliant" ? "success" : status === "warning" ? "warning" : "error"}
          shape="pill"
        >
          {statusText}
        </Badge>
      </div>

      {description && (
        <p className="text-xs text-(--text-secondary) leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {date && (
        <div className="border-t border-(--border-default) pt-3 text-[10px] text-(--text-secondary)">
          {date}
        </div>
      )}
    </div>
  )
}
