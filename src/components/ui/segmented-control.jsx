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
        "inline-flex h-10 items-center justify-center rounded-sm bg-(--bg-page-alt) p-1 text-(--text-muted) dark:bg-(--bg-card) border border-(--border-default)",
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
              "relative z-10 flex h-full items-center justify-center px-4 py-1.5 text-sm font-medium transition-all select-none cursor-pointer rounded-sm hover:text-(--text-primary) focus-visible:outline-none",
              isActive ? "text-(--text-primary)" : "text-(--text-secondary)"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`segmented-active-${name}`}
                className="absolute inset-0 -z-10 rounded-sm bg-paper shadow-(--shadow-1) dark:bg-(--bg-card-raised)"
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
