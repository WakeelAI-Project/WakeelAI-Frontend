import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus) disabled:pointer-events-none disabled:bg-(--bg-disabled) disabled:text-(--text-secondary) disabled:border-none select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-(--brand-primary) text-(--text-inverse) hover:bg-(--brand-primary-hover) active:bg-(--brand-primary-active) shadow-(--shadow-1)",
        legal: "bg-(--official-primary) text-(--text-inverse) hover:bg-(--brand-primary-hover) active:bg-(--brand-primary-active) shadow-(--shadow-1)",
        ai: "bg-(--ai-primary) text-(--text-on-accent) hover:bg-(--accent-primary-hover) active:bg-(--accent-primary-active) shadow-(--shadow-1)",
        secondary: "bg-(--bg-card) text-(--text-primary) border border-(--border-default) hover:bg-(--bg-card-raised) active:bg-(--bg-page-alt)",
        ghost: "text-(--brand-primary) hover:bg-(--bg-page-alt) active:bg-(--bg-card-raised)",
        danger: "bg-(--status-error-fg) text-(--color-paper) hover:bg-[#962e2e] active:bg-[#7a2323] shadow-sm",
        fab: "fixed bottom-6 end-6 bg-(--ai-primary) text-(--text-on-accent) hover:bg-(--accent-primary-hover) active:bg-(--accent-primary-active) shadow-(--shadow-3) z-50 rounded-2xl"
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-xs",
        sm: "h-8 px-3 text-xs rounded-sm",
        md: "h-10 px-4 text-sm rounded-sm",
        lg: "h-12 px-6 text-base rounded-md min-w-[44px] sm:min-w-[48px]",
        xl: "h-14 px-8 text-base rounded-lg min-w-[48px]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, isLoading = false, loadingText, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const content = (
      <>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {isLoading && loadingText ? <span>{loadingText}</span> : children}
      </>
    )

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={props.disabled || isLoading}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
