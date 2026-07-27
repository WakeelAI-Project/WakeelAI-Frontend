import React from "react"
import { cn } from "../../lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-skeleton rounded-sm bg-(--bg-page-alt) dark:bg-(--bg-card-raised)", className)}
      {...props}
    />
  )
}

export { Skeleton }
