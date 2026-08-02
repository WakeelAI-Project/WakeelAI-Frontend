import React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-sm border border-(--border-default) bg-paper px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) disabled:cursor-not-allowed disabled:bg-(--bg-disabled) disabled:text-(--text-muted) dark:bg-(--bg-card) dark:border-(--border-emphasis) cursor-pointer text-start",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", side = "bottom", sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 overflow-hidden rounded-md border border-(--border-default) bg-paper p-1 text-(--text-primary) shadow-(--shadow-2) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 dark:bg-(--bg-card-raised) dark:border-(--border-emphasis)",
        position === "popper" &&
          "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 ps-8 pe-2 text-xs font-semibold text-(--text-secondary) text-start", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-xs px-2.5 py-2 ps-8 text-sm text-(--text-primary) outline-none transition-colors focus:bg-(--bg-page-alt) data-highlighted:bg-(--bg-page-alt) data-[state=checked]:text-(--ai-primary) data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-(--border-emphasis) dark:data-[highlighted]:bg-(--border-emphasis) text-start",
      className
    )}
    {...props}
  >
    <span className="absolute inset-s-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-(--ai-primary)" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-(--border-default) dark:bg-(--border-emphasis)", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
