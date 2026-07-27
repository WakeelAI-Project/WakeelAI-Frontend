import React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef(({ className, label, ...props }, ref) => (
  <div className="flex items-center gap-2">
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-xs border border-(--border-emphasis) bg-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:bg-(--bg-disabled) disabled:text-(--text-muted) data-[state=checked]:bg-(--brand-primary) data-[state=checked]:text-paper data-[state=checked]:border-none cursor-pointer flex items-center justify-center dark:bg-(--bg-card) dark:border-(--border-emphasis) dark:data-[state=checked]:bg-(--brand-primary)",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {label && (
      <label
        onClick={(e) => {
          const target = e.currentTarget.previousSibling
          target?.click()
        }}
        className="text-sm font-medium text-(--text-primary) select-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    )}
  </div>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
