import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export function Dropdown({
  label,
  required = false,
  value,
  onValueChange,
  disabled = false,
  placeholder,
  options = [],
  getOptionValue = (option) => option?.value ?? option,
  getOptionLabel = (option) => option?.label ?? option,
  errorText,
  ariaLabel,
}) {
  return (
    <div className="w-full flex flex-col gap-1.5 text-start">
      {label && (
        <label className="text-sm font-medium text-(--text-primary) select-none">
          {label}
          {required && <span className="text-(--text-muted) ms-1">*</span>}
        </label>
      )}

      <Select value={value || ""} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          aria-label={ariaLabel || label}
          className={
            errorText
              ? "border-(--status-error-fg) focus:border-(--status-error-fg) focus:ring-(--status-error-fg)"
              : undefined
          }
        >
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const rawOptionValue = getOptionValue(option)
            if (rawOptionValue === undefined || rawOptionValue === null || rawOptionValue === "") {
              return null
            }
            const optionValue = String(rawOptionValue)

            return (
              <SelectItem key={optionValue} value={optionValue}>
                {getOptionLabel(option) || optionValue}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {errorText && (
        <p className="text-xs text-(--status-error-fg)" role="alert">
          {errorText}
        </p>
      )}
    </div>
  )
}
