import React from "react"
import { cn } from "../../lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-skeleton rounded-[var(--radius-sm)] bg-[var(--bg-page-alt)] dark:bg-[var(--bg-card-raised)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
