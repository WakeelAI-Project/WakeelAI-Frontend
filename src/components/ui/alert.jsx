import React from "react"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[var(--radius-md)] border-y border-e border-inline-start-4 p-4 text-start flex gap-3 items-start select-none",
  {
    variants: {
      variant: {
        success: "bg-[var(--status-success-bg)] border-[var(--border-default)] border-inline-start-[var(--status-success-fg)] text-[var(--status-success-fg)]",
        warning: "bg-[var(--status-warning-bg)] border-[var(--border-default)] border-inline-start-[var(--status-warning-fg)] text-[var(--status-warning-fg)]",
        error: "bg-[var(--status-error-bg)] border-[var(--border-default)] border-inline-start-[var(--status-error-fg)] text-[var(--status-error-fg)]",
        info: "bg-[var(--status-info-bg)] border-[var(--border-default)] border-inline-start-[var(--status-info-fg)] text-[var(--status-info-fg)]"
      }
    },
    defaultVariants: {
      variant: "info"
    }
  }
)

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info
}

export function Alert({ className, variant = "info", title, children, ...props }) {
  const IconComponent = icons[variant || "info"]

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props} role="alert">
      <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        {title && <span className="font-semibold text-sm leading-none">{title}</span>}
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  )
}
