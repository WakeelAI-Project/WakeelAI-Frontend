import React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  name = "segmented-control",
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 max-w-full items-center justify-start overflow-x-auto rounded-sm border border-(--border-default) bg-(--bg-page-alt) p-1 text-(--text-muted) dark:bg-(--bg-card)",
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
              "relative z-10 flex h-full shrink-0 items-center justify-center rounded-sm px-4 py-1.5 text-sm font-medium transition-all select-none cursor-pointer hover:text-(--text-primary) focus-visible:outline-none",
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
            <span className="relative z-20">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
