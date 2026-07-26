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
                  isCompleted && "bg-[var(--bark-500)] border-[var(--bark-500)] text-[var(--stone-0)]",
                  isActive && "border-[var(--teal-500)] bg-[var(--teal-50)] text-[var(--teal-700)] ring-2 ring-[var(--border-focus)] ring-offset-2 dark:bg-[var(--teal-900)] dark:text-[var(--teal-300)]",
                  !isActive && !isCompleted && "border-[var(--border-default)] bg-[var(--stone-50)] text-[var(--text-secondary)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)]"
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
                  <span className="text-xs text-[var(--stone-500)]">{step.description}</span>
                )}
              </div>
            </div>

            {/* Separator Line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded transition-all duration-300",
                  isCompleted ? "bg-[var(--bark-500)]" : "bg-[var(--border-default)] dark:bg-[var(--stone-800)]"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
