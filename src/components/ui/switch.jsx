import React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "../../lib/utils"

const Switch = React.forwardRef(({ className, label, variant = "system", ...props }, ref) => (
  <div className="flex items-center gap-3">
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[var(--bg-disabled)] dark:bg-[var(--bg-card-raised)]",
        variant === "system"
          ? "data-[state=checked]:bg-[var(--ai-primary)]"
          : "data-[state=checked]:bg-[var(--accent-primary)]",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-[var(--color-paper)] shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 rtl:data-[state=checked]:-translate-x-5"
        )}
      />
    </SwitchPrimitive.Root>
    {label && (
      <label
        onClick={(e) => {
          const target = e.currentTarget.previousSibling
          target?.click()
        }}
        className="text-sm font-medium text-[var(--text-primary)] select-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    )}
  </div>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
