import React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export function SealMark({ className, iconClassName }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-(--ai-primary) bg-(--brand-primary) text-(--ai-primary) shadow-(--shadow-1)",
        className
      )}
      aria-hidden="true"
    >
      <span className="inline-flex h-4 w-4 rotate-45 items-center justify-center rounded-xs border border-current">
        <Check className={cn("h-3 w-3 -rotate-45", iconClassName)} strokeWidth={3} />
      </span>
    </span>
  )
}
