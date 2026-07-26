import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:pointer-events-none disabled:bg-[var(--stone-200)] disabled:text-[var(--stone-400)] disabled:border-none select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[var(--bark-500)] text-[var(--stone-0)] hover:bg-[var(--bark-600)] active:bg-[var(--bark-700)] shadow-sm",
        legal: "bg-[var(--ochre-600)] text-[var(--stone-0)] hover:bg-[var(--ochre-700)] active:bg-[var(--ochre-800)] shadow-sm",
        ai: "bg-[var(--teal-600)] text-[var(--stone-0)] hover:bg-[var(--teal-700)] active:bg-[var(--teal-800)] shadow-sm",
        secondary: "bg-[var(--stone-0)] text-[var(--color-ink)] border border-[var(--border-default)] hover:bg-[var(--stone-50)] active:bg-[var(--stone-100)] dark:bg-[var(--stone-800)] dark:text-[var(--stone-50)] dark:hover:bg-[var(--stone-850)]",
        ghost: "text-[var(--bark-700)] hover:bg-[var(--stone-100)] active:bg-[var(--stone-150)] dark:text-[var(--stone-400)] dark:hover:bg-[var(--stone-800)]",
        danger: "bg-[var(--status-error)] text-[var(--stone-0)] hover:bg-[#962e2e] active:bg-[#7a2323] shadow-sm",
        fab: "fixed bottom-6 end-6 bg-[var(--teal-500)] text-[var(--stone-0)] hover:bg-[var(--teal-600)] active:bg-[var(--teal-700)] shadow-lg z-50 rounded-[var(--radius-2xl)]"
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

    const tapScale = props.disabled || isLoading ? 1 : 0.96
    const hoverScale = props.disabled || isLoading ? 1 : 1.01

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
      <motion.button
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {content}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
