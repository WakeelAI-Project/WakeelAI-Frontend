import React from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "../../lib/utils"

export function StatCard({
  title,
  value,
  domain = "neutral", // neutral, AI, legal, employee, leave, document
  trend, // { value: number, isPositive: boolean }
  description,
  className
}) {
  const domainColors = {
    neutral: "text-(--border-emphasis) dark:text-(--bg-disabled)",
    AI: "text-(--ai-primary) dark:text-(--ai-primary)",
    legal: "text-(--accent-primary) dark:text-(--accent-primary-hover)",
    employee: "text-(--brand-primary) dark:text-(--brand-primary-hover)",
    leave: "text-(--ai-primary) dark:text-(--ai-primary)",
    document: "text-(--accent-primary-active) dark:text-(--accent-primary-hover)",
  }

  return (
    <div
      className={cn(
        "rounded-md border border-(--border-default) bg-paper p-5 flex flex-col gap-3 dark:bg-(--bg-card) dark:border-(--bg-card-raised) text-start shadow-sm select-none",
        className
      )}
    >
      {/* Title */}
      <span className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
        {title}
      </span>

      {/* Value & Trend */}
      <div className="flex items-baseline justify-between gap-4 shrink-0">
        <span
          className={cn(
            "text-3xl font-bold font-mono tracking-tight tabular-nums",
            domainColors[domain]
          )}
        >
          {value}
        </span>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.isPositive
                ? "bg-emerald-50 text-(--status-success-fg) dark:bg-emerald-950/20"
                : "bg-rose-50 text-(--status-error-fg) dark:bg-rose-950/20"
            )}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            <span className="font-mono">{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Description / Caption */}
      {description && (
        <span className="text-xs text-(--text-muted) leading-relaxed truncate">
          {description}
        </span>
      )}
    </div>
  )
}
