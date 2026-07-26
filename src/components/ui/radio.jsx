import React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2.5", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ className, label, ...props }, ref) => {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "aspect-square h-5 w-5 rounded-full border border-[var(--border-emphasis)] bg-[var(--stone-0)] text-[var(--stone-0)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--stone-200)] disabled:text-[var(--stone-400)] data-[state=checked]:bg-[var(--bark-500)] data-[state=checked]:border-none cursor-pointer flex items-center justify-center dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)] dark:data-[state=checked]:bg-[var(--bark-500)]",
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2 w-2 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
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
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
