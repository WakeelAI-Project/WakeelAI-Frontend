import React, { useState } from "react"
import { Eye, EyeOff, Search } from "lucide-react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(
  ({ className, type = "text", label, hintText, errorText, prefixIcon, suffixIcon, currencySymbol, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const isSearch = type === "search"
    const isCurrency = !!currencySymbol

    const handleTogglePassword = (e) => {
      e.preventDefault()
      setShowPassword((prev) => !prev)
    }

    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className="w-full flex flex-col gap-1.5 text-start">
        {label && (
          <label className="text-sm font-medium text-[var(--text-primary)] select-none">
            {label}
            {props.required && <span className="text-[var(--stone-500)] ms-1">*</span>}
          </label>
        )}

        <div className="relative w-full flex items-center">
          {/* Prefix Icon / Search Icon */}
          {isSearch && !prefixIcon && (
            <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-[var(--stone-400)]">
              <Search className="h-4 w-4" />
            </div>
          )}
          {prefixIcon && (
            <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-[var(--stone-400)]">
              {prefixIcon}
            </div>
          )}

          {/* Currency Prefix */}
          {isCurrency && (
            <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-sm font-mono text-[var(--stone-500)]">
              {currencySymbol}
            </span>
          )}

          <input
            type={resolvedType}
            className={cn(
              "flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--stone-0)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--stone-400)] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--stone-200)] disabled:text-[var(--stone-400)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)] dark:focus-visible:ring-[var(--border-focus)]",
              (isSearch || prefixIcon || isCurrency) && "ps-10",
              (isPassword || suffixIcon) && "pe-10",
              errorText && "border-[var(--status-error)] focus-visible:ring-[var(--status-error)] focus-visible:border-[var(--status-error)]",
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Suffix Icon / Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={handleTogglePassword}
              tabIndex={-1}
              className="absolute inset-y-0 end-3 flex items-center text-[var(--stone-400)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {!isPassword && suffixIcon && (
            <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-[var(--stone-400)]">
              {suffixIcon}
            </div>
          )}
        </div>

        {/* Hints and Errors */}
        {errorText ? (
          <p className="text-xs text-[var(--status-error)]" role="alert">
            {errorText}
          </p>
        ) : (
          hintText && <p className="text-xs text-[var(--text-secondary)]">{hintText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export const Textarea = React.forwardRef(
  ({ className, label, hintText, errorText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-start">
        {label && (
          <label className="text-sm font-medium text-[var(--text-primary)] select-none">
            {label}
            {props.required && <span className="text-[var(--stone-500)] ms-1">*</span>}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--stone-0)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--stone-400)] focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--stone-200)] disabled:text-[var(--stone-400)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)]",
            errorText && "border-[var(--status-error)] focus-visible:ring-[var(--status-error)] focus-visible:border-[var(--status-error)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {errorText ? (
          <p className="text-xs text-[var(--status-error)]" role="alert">
            {errorText}
          </p>
        ) : (
          hintText && <p className="text-xs text-[var(--text-secondary)]">{hintText}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Input }
