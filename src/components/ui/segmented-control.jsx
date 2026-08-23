import React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  fullWidth = false,
  name = "segmented-control",
}) {
  const isFullWidth = fullWidth || className?.includes("w-full")

  return (
    <div
      className={cn(
        "inline-flex h-10 max-w-full items-center rounded-sm border border-(--border-default) bg-(--bg-page-alt) p-1 text-(--text-muted) dark:bg-(--bg-card)",
        isFullWidth ? "flex w-full" : "justify-start overflow-x-auto",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex h-full items-center justify-center rounded-sm px-4 py-1.5 text-sm font-medium transition-all select-none cursor-pointer hover:text-(--text-primary) focus-visible:outline-none text-center",
              isFullWidth ? "flex-1 min-w-0" : "shrink-0",
              isActive ? "text-(--text-primary)" : "text-(--text-secondary)"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`segmented-active-${name}`}
                className="absolute inset-0 -z-10 rounded-sm bg-(--bg-card-raised)/85 shadow-(--shadow-4) backdrop-blur-2xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-20 truncate text-center">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
