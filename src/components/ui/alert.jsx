import React from "react"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-md border-y border-e border-inline-start-4 p-4 text-start flex gap-3 items-start select-none",
  {
    variants: {
      variant: {
        success: "bg-(--status-success-bg) border-(--border-default) border-inline-start-(--status-success-fg) text-(--status-success-fg)",
        warning: "bg-(--status-warning-bg) border-(--border-default) border-inline-start-(--status-warning-fg) text-(--status-warning-fg)",
        error: "bg-(--status-error-bg) border-(--border-default) border-inline-start-(--status-error-fg) text-(--status-error-fg)",
        info: "bg-(--status-info-bg) border-(--border-default) border-inline-start-(--status-info-fg) text-(--status-info-fg)"
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
