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
          <label className="text-sm font-medium text-(--text-primary) select-none">
            {label}
            {props.required && <span className="text-(--text-muted) ms-1">*</span>}
          </label>
        )}

        <div className="relative w-full flex items-center">
          {/* Prefix Icon / Search Icon */}
          {isSearch && !prefixIcon && (
            <div className="absolute inset-y-0 inset-s-3 flex items-center pointer-events-none text-(--text-muted)">
              <Search className="h-4 w-4" />
            </div>
          )}
          {prefixIcon && (
            <div className="absolute inset-y-0 inset-s-3 flex items-center pointer-events-none text-(--text-muted)">
              {prefixIcon}
            </div>
          )}

          {/* Currency Prefix */}
          {isCurrency && (
            <span className="absolute inset-y-0 inset-s-3 flex items-center pointer-events-none text-sm font-mono text-(--text-muted)">
              {currencySymbol}
            </span>
          )}

          <input
            type={resolvedType}
            className={cn(
              "flex h-10 w-full rounded-sm border border-(--border-default) bg-paper px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-(--border-focus) focus-visible:ring-1 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:bg-(--bg-disabled) disabled:text-(--text-secondary) dark:bg-(--bg-card) dark:border-(--border-emphasis) dark:focus-visible:ring-(--border-focus)",
              (isSearch || prefixIcon || isCurrency) && "ps-10",
              (isPassword || suffixIcon) && "pe-10",
              errorText && "border-(--status-error-fg) focus-visible:ring-(--status-error-fg) focus-visible:border-(--status-error-fg)",
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
              className="absolute inset-y-0 inset-e-3 flex items-center text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {!isPassword && suffixIcon && (
            <div className="absolute inset-y-0 inset-e-3 flex items-center pointer-events-none text-(--text-muted)">
              {suffixIcon}
            </div>
          )}
        </div>

        {/* Hints and Errors */}
        {errorText ? (
          <p className="text-xs text-(--status-error-fg)" role="alert">
            {errorText}
          </p>
        ) : (
          hintText && <p className="text-xs text-(--text-secondary)">{hintText}</p>
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
          <label className="text-sm font-medium text-(--text-primary) select-none">
            {label}
            {props.required && <span className="text-(--text-muted) ms-1">*</span>}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-20 w-full rounded-sm border border-(--border-default) bg-paper px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus-visible:outline-none focus-visible:border-(--border-focus) focus-visible:ring-1 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:bg-(--bg-disabled) disabled:text-(--text-secondary) dark:bg-(--bg-card) dark:border-(--border-emphasis)",
            errorText && "border-(--status-error-fg) focus-visible:ring-(--status-error-fg) focus-visible:border-(--status-error-fg)",
            className
          )}
          ref={ref}
          {...props}
        />
        {errorText ? (
          <p className="text-xs text-(--status-error-fg)" role="alert">
            {errorText}
          </p>
        ) : (
          hintText && <p className="text-xs text-(--text-secondary)">{hintText}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Input }
