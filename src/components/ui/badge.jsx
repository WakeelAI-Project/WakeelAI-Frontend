import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold select-none border transition-colors",
  {
    variants: {
      variant: {
        ai: "bg-(--ai-surface) text-(--ai-primary) border-(--border-default)",
        legal: "bg-(--legal-surface) text-(--legal-primary) border-(--border-default)",
        employee: "bg-(--bg-card-raised) text-(--text-secondary) border-(--border-default)",
        leave: "bg-(--ai-surface) text-(--ai-primary) border-(--border-default)",
        document: "bg-(--legal-surface) text-(--legal-primary) border-(--border-default)",
        success: "bg-(--status-success-bg) text-(--status-success-fg) border-(--border-default)",
        warning: "bg-(--status-warning-bg) text-(--status-warning-fg) border-(--border-default)",
        error: "bg-(--status-error-bg) text-(--status-error-fg) border-(--border-default)",
        info: "bg-(--status-info-bg) text-(--status-info-fg) border-(--border-default)"
      },
      shape: {
        badge: "rounded-xs",
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
