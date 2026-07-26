import React from "react"
import { cn } from "../../lib/utils"

export function Timeline({
  items = [],
  isRtl = true,
  className
}) {
  return (
    <div className={cn("relative flex flex-col gap-6 select-none", className)}>
      {/* Vertical center axis line */}
      <div
        className={cn(
          "absolute top-1 bottom-1 w-0.5 bg-[var(--border-default)] dark:bg-[var(--stone-800)]",
          isRtl ? "right-[17px]" : "left-[17px]"
        )}
      />

      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "relative flex gap-4 text-start items-start",
            isRtl ? "flex-row-reverse pl-6" : "flex-row pr-6"
          )}
        >
          {/* Timeline Dot Marker */}
          <div
            className={cn(
              "w-9 h-9 rounded-full border-2 border-[var(--color-paper)] bg-[var(--stone-0)] shadow-sm flex items-center justify-center relative z-10 shrink-0 dark:bg-[var(--stone-900)] dark:border-[var(--stone-850)]",
              item.isCompleted
                ? "border-[var(--bark-500)] text-[var(--bark-500)] dark:border-[var(--bark-500)]"
                : "border-[var(--border-default)] text-[var(--stone-500)] dark:border-[var(--stone-700)]"
            )}
          >
            {item.icon ? (
              <item.icon className="h-4 w-4" />
            ) : (
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  item.isCompleted ? "bg-[var(--bark-500)]" : "bg-[var(--stone-400)]"
                )}
              />
            )}
          </div>

          {/* Timeline content bubble */}
          <div className="flex-1 flex flex-col pt-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="font-semibold text-sm text-[var(--text-primary)]">
                {item.title}
              </span>
              <span className="text-[10px] text-[var(--stone-500)] font-mono font-medium">
                {item.date}
              </span>
            </div>
            {item.description && (
              <span className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                {item.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
