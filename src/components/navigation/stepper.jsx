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
                  isCompleted && "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-[var(--color-paper)]",
                  isActive && "border-[var(--ai-primary)] bg-[var(--ai-surface)] text-[var(--accent-primary-active)] ring-2 ring-[var(--border-focus)] ring-offset-2 dark:bg-[var(--accent-primary-active)] dark:text-[var(--ai-primary)]",
                  !isActive && !isCompleted && "border-[var(--border-default)] bg-[var(--bg-card-raised)] text-[var(--text-secondary)] dark:bg-[var(--bg-card)] dark:border-[var(--border-emphasis)]"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : stepNum}
              </div>
              <div className="hidden sm:flex flex-col text-start">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-[var(--text-muted)]">{step.description}</span>
                )}
              </div>
            </div>

            {/* Separator Line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded transition-all duration-300",
                  isCompleted ? "bg-[var(--brand-primary)]" : "bg-[var(--border-default)] dark:bg-[var(--bg-card-raised)]"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
