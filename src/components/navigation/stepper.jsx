import React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export function Stepper({ steps = [], currentStep = 1, className }) {
  return (
    <div className={cn("w-full flex items-center justify-between gap-4", className)}>
      {steps.map((step, idx) => {
        const stepNum = idx + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep

        return (
          <React.Fragment key={idx}>
            {/* Step Marker */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold select-none transition-all duration-300",
                  isCompleted && "bg-(--brand-primary) border-(--brand-primary) text-paper",
                  isActive && "border-(--ai-primary) bg-(--ai-surface) text-(--accent-primary-active) ring-2 ring-(--border-focus) ring-offset-2 dark:bg-(--accent-primary-active) dark:text-(--ai-primary)",
                  !isActive && !isCompleted && "border-(--border-default) bg-(--bg-card-raised) text-(--text-secondary) dark:bg-(--bg-card) dark:border-(--border-emphasis)"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : stepNum}
              </div>
              <div className="hidden sm:flex flex-col text-start">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-(--text-primary)" : "text-(--text-secondary)"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-(--text-muted)">{step.description}</span>
                )}
              </div>
            </div>

            {/* Separator Line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded transition-all duration-300",
                  isCompleted ? "bg-(--brand-primary)" : "bg-(--border-default) dark:bg-(--bg-card-raised)"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
