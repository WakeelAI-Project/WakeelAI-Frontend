import React from "react"
import { cn } from "../../lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-skeleton rounded-[var(--radius-sm)] bg-[var(--stone-100)] dark:bg-[var(--stone-800)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
