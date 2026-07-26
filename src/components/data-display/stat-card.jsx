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
    neutral: "text-[var(--border-emphasis)] dark:text-[var(--bg-disabled)]",
    AI: "text-[var(--ai-primary)] dark:text-[var(--ai-primary)]",
    legal: "text-[var(--accent-primary)] dark:text-[var(--accent-primary-hover)]",
    employee: "text-[var(--brand-primary)] dark:text-[var(--brand-primary-hover)]",
    leave: "text-[var(--ai-primary)] dark:text-[var(--ai-primary)]",
    document: "text-[var(--accent-primary-active)] dark:text-[var(--accent-primary-hover)]",
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-paper)] p-5 flex flex-col gap-3 dark:bg-[var(--bg-card)] dark:border-[var(--bg-card-raised)] text-start shadow-sm select-none",
        className
      )}
    >
      {/* Title */}
      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
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
                ? "bg-emerald-50 text-[var(--status-success-fg)] dark:bg-emerald-950/20"
                : "bg-rose-50 text-[var(--status-error-fg)] dark:bg-rose-950/20"
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
        <span className="text-xs text-[var(--text-muted)] leading-relaxed truncate">
          {description}
        </span>
      )}
    </div>
  )
}
