import React, { useRef, useState, useEffect } from "react"
import { cn } from "../../lib/utils"

export function OTPInput({ length = 6, value, onChange, disabled = false, error = false }) {
  const [values, setValues] = useState(() => {
    const arr = Array(length).fill("")
    for (let i = 0; i < value.length && i < length; i++) {
      arr[i] = value[i]
    }
    return arr
  })
  const inputRefs = useRef([])

  useEffect(() => {
    const arr = Array(length).fill("")
    for (let i = 0; i < value.length && i < length; i++) {
      arr[i] = value[i]
    }
    setValues(arr)
  }, [value, length])

  const handleChange = (e, index) => {
    const val = e.target.value
    if (!/^[0-9]?$/.test(val)) return

    const newValues = [...values]
    newValues[index] = val
    setValues(newValues)
    onChange(newValues.join(""))

    if (val !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && values[index] === "") {
      const newValues = [...values]
      newValues[index - 1] = ""
      setValues(newValues)
      onChange(newValues.join(""))
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    if (disabled) return

    const pasteData = e.clipboardData.getData("text/plain").trim().slice(0, length)
    if (!/^\d+$/.test(pasteData)) return

    const newValues = Array(length).fill("")
    for (let i = 0; i < pasteData.length; i++) {
      newValues[i] = pasteData[i]
    }
    setValues(newValues)
    onChange(newValues.join(""))

    const focusIndex = Math.min(pasteData.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2.5 dir-ltr select-none">
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[index]}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => (inputRefs.current[index] = el)}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-paper)] focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-muted)] dark:bg-[var(--bg-card)] dark:border-[var(--border-emphasis)]",
              error && "border-[var(--status-error-fg)] focus-visible:ring-[var(--status-error-fg)] focus-visible:border-[var(--status-error-fg)]"
            )}
          />
        ))}
    </div>
  )
}
