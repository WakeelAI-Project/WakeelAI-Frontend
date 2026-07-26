import React, { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, X, Search } from "lucide-react"
import { Badge } from "./badge"
import { cn } from "../../lib/utils"

export function Combobox({
  options = [],
  value = "",
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  label,
  errorText,
  disabled = false,
  className
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={containerRef} className={cn("relative w-full flex flex-col gap-1.5 text-start", className)}>
      {label && (
        <span className="text-sm font-medium text-[var(--text-primary)] select-none">
          {label}
        </span>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--stone-0)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--stone-200)] disabled:text-[var(--stone-400)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)] cursor-pointer text-start",
          errorText && "border-[var(--status-error)]"
        )}
      >
        <span className={cn(!selectedOption && "text-[var(--stone-400)]")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] start-0 z-50 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-paper)] p-1 text-[var(--text-primary)] shadow-[var(--elevation-2)] dark:bg-[var(--stone-800)] dark:border-[var(--stone-700)]">
          <div className="flex items-center border-b border-[var(--border-default)] px-3 dark:border-[var(--stone-700)] pb-1 pt-0.5">
            <Search className="h-4 w-4 opacity-50 me-2 shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-8 w-full bg-transparent py-1 text-sm outline-none placeholder:text-[var(--stone-400)]"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto pt-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-[var(--text-secondary)]">
                No results found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                      setSearch("")
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-[var(--radius-xs)] hover:bg-[var(--stone-100)] dark:hover:bg-[var(--stone-700)] text-start cursor-pointer",
                      isSelected && "text-[var(--teal-600)]"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
      {errorText && <p className="text-xs text-[var(--status-error)]">{errorText}</p>}
    </div>
  )
}

/* Multi-Select Component */
export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select multiple...",
  label,
  className
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full flex flex-col gap-1.5 text-start", className)}>
      {label && (
        <span className="text-sm font-medium text-[var(--text-primary)] select-none">
          {label}
        </span>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--stone-0)] px-3 py-1 text-sm text-[var(--text-primary)] focus-within:border-[var(--border-focus)] focus-within:ring-1 focus-within:ring-[var(--border-focus)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)] cursor-pointer"
      >
        <div className="flex flex-wrap gap-1 items-center">
          {value.length === 0 ? (
            <span className="text-[var(--stone-400)]">{placeholder}</span>
          ) : (
            value.map((v) => {
              const opt = options.find((o) => o.value === v)
              return (
                <Badge
                  key={v}
                  variant="employee"
                  shape="pill"
                  className="flex items-center gap-1 py-0.5 px-2 font-medium"
                >
                  <span>{opt?.label || v}</span>
                  <X
                    className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(v)
                    }}
                  />
                </Badge>
              )
            })
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] start-0 z-50 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-paper)] p-1 text-[var(--text-primary)] shadow-[var(--elevation-2)] dark:bg-[var(--stone-800)] dark:border-[var(--stone-700)]">
          <div className="max-h-[200px] overflow-y-auto">
            {options.map((opt) => {
              const isSelected = value.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-[var(--radius-xs)] hover:bg-[var(--stone-100)] dark:hover:bg-[var(--stone-700)] text-start cursor-pointer"
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-[var(--teal-600)]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
