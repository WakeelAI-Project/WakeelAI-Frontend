import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:pointer-events-none disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-muted)] disabled:border-none select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[var(--brand-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] shadow-[var(--shadow-1)]",
        legal: "bg-[var(--official-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] shadow-[var(--shadow-1)]",
        ai: "bg-[var(--ai-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-primary-hover)] active:bg-[var(--accent-primary-active)] shadow-[var(--shadow-1)]",
        secondary: "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-card-raised)] active:bg-[var(--bg-page-alt)]",
        ghost: "text-[var(--brand-primary)] hover:bg-[var(--bg-page-alt)] active:bg-[var(--bg-card-raised)]",
        danger: "bg-[var(--status-error-fg)] text-[var(--color-paper)] hover:bg-[#962e2e] active:bg-[#7a2323] shadow-sm",
        fab: "fixed bottom-6 end-6 bg-[var(--ai-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-primary-hover)] active:bg-[var(--accent-primary-active)] shadow-[var(--shadow-3)] z-50 rounded-[var(--radius-2xl)]"
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-[var(--radius-xs)]",
        sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
        md: "h-10 px-4 text-sm rounded-[var(--radius-sm)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-md)] min-w-[44px] sm:min-w-[48px]",
        xl: "h-14 px-8 text-base rounded-[var(--radius-lg)] min-w-[48px]"
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
          {content}
        </Comp>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
