import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold select-none border transition-colors",
  {
    variants: {
      variant: {
        ai: "bg-[var(--ai-surface)] text-[var(--ai-primary)] border-[var(--border-default)]",
        legal: "bg-[var(--legal-surface)] text-[var(--legal-primary)] border-[var(--border-default)]",
        employee: "bg-[var(--bg-card-raised)] text-[var(--text-secondary)] border-[var(--border-default)]",
        leave: "bg-[var(--ai-surface)] text-[var(--ai-primary)] border-[var(--border-default)]",
        document: "bg-[var(--legal-surface)] text-[var(--legal-primary)] border-[var(--border-default)]",
        success: "bg-[var(--status-success-bg)] text-[var(--status-success-fg)] border-[var(--border-default)]",
        warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border-[var(--border-default)]",
        error: "bg-[var(--status-error-bg)] text-[var(--status-error-fg)] border-[var(--border-default)]",
        info: "bg-[var(--status-info-bg)] text-[var(--status-info-fg)] border-[var(--border-default)]"
      },
      shape: {
        badge: "rounded-[var(--radius-xs)]",
        pill: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "info",
      shape: "badge"
    }
  }
)

function Badge({ className, variant, shape, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, shape }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
