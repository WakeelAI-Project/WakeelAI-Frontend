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
    compliant: "border-inline-start-[var(--status-success-fg)] bg-[var(--status-success-bg)] text-[var(--status-success-fg)] border-[var(--border-default)]",
    warning: "border-inline-start-[var(--status-warning-fg)] bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border-[var(--border-default)]",
    "non-compliant": "border-inline-start-[var(--status-error-fg)] bg-[var(--status-error-bg)] text-[var(--status-error-fg)] border-[var(--border-default)]"
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
        "rounded-[var(--radius-md)] border-y border-e border-inline-start-4 bg-[var(--bg-card)] p-5 flex flex-col justify-between gap-4 dark:bg-[var(--bg-card)] text-start shadow-sm",
        statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--bg-card-raised)] text-[var(--text-secondary)] shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-secondary)] font-mono font-medium">
              {articleNumber}
            </span>
            <span className="font-semibold text-sm text-[var(--text-primary)] mt-0.5">
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
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {date && (
        <div className="border-t border-[var(--border-default)] pt-3 text-[10px] text-[var(--text-secondary)]">
          {date}
        </div>
      )}
    </div>
  )
}
