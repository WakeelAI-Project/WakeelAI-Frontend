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
        "inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--stone-100)] p-1 text-[var(--stone-500)] dark:bg-[var(--stone-900)] border border-[var(--border-default)]",
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
              "relative z-10 flex h-full items-center justify-center px-4 py-1.5 text-sm font-medium transition-all select-none cursor-pointer rounded-[var(--radius-sm)] hover:text-[var(--text-primary)] focus-visible:outline-none",
              isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`segmented-active-${name}`}
                className="absolute inset-0 -z-10 rounded-[var(--radius-sm)] bg-[var(--stone-0)] shadow-[var(--elevation-1)] dark:bg-[var(--stone-800)]"
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
