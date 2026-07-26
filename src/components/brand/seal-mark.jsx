import React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export function SealMark({ className, iconClassName }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--ai-primary)] bg-[var(--brand-primary)] text-[var(--ai-primary)] shadow-[var(--shadow-1)]",
        className
      )}
      aria-hidden="true"
    >
      <span className="inline-flex h-4 w-4 rotate-45 items-center justify-center rounded-[var(--radius-xs)] border border-current">
        <Check className={cn("h-3 w-3 -rotate-45", iconClassName)} strokeWidth={3} />
      </span>
    </span>
  )
}
