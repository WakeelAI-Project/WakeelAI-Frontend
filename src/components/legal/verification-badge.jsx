import React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { useLocale } from "../../hooks/use-locale"

export function VerificationBadge({
  isVerified = true,
  label = "موثق قانونياً",
  labelEn = "Legally Verified",
  className
}) {
  const { isRtl } = useLocale()

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-(--legal-surface) text-(--legal-primary) border border-(--border-default) text-xs font-semibold select-none",
        !isVerified && "bg-(--bg-card-raised) text-(--text-secondary) border-(--border-default)",
        className
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full border border-current border-t-transparent border-r-transparent flex items-center justify-center rotate-45 shrink-0",
          isVerified ? "opacity-100" : "opacity-40"
        )}
      >
        {isVerified && (
          <Check className="h-2.5 w-2.5 -rotate-45 text-(--legal-primary)" strokeWidth={3} />
        )}
      </div>
      <span>{isRtl ? label : labelEn}</span>
    </div>
  )
}
