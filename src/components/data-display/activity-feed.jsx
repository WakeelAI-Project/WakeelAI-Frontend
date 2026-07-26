import React from "react"
import { Sparkles, User, FileText, Calendar, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"

export function ActivityFeed({
  items = [],
  isRtl = true,
  className
}) {
  const domainIcons = {
    AI: Sparkles,
    employee: User,
    legal: FileText,
    leave: Calendar,
    system: AlertCircle
  }

  const domainColors = {
    AI: "bg-[var(--teal-25)] text-[var(--teal-600)] dark:bg-[var(--teal-900)/20] dark:text-[var(--teal-400)]",
    employee: "bg-[var(--bark-50)] text-[var(--bark-600)] dark:bg-[var(--bark-900)/20] dark:text-[var(--bark-400)]",
    legal: "bg-[var(--ochre-50)] text-[var(--ochre-600)] dark:bg-[var(--ochre-900)/20] dark:text-[var(--ochre-400)]",
    leave: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
    system: "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
  }

  return (
    <div className={cn("w-full flex flex-col gap-4 select-none", className)}>
      {items.map((item, idx) => {
        const Icon = domainIcons[item.domain] || AlertCircle
        const colorClass = domainColors[item.domain] || "bg-[var(--stone-100)]"

        return (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--stone-0)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-800)] text-start shadow-sm"
          >
            {/* Domain Icon */}
            <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-[var(--stone-500)] font-mono font-medium shrink-0">
                  {item.timestamp}
                </span>
              </div>
              {item.description && (
                <span className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
