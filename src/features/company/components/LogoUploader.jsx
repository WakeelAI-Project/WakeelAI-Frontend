// Story #167 — Logo Upload component
// Story #168 — Logo validation (type + size)

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Camera, Trash2 } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useToast } from "../../../components/ui/toast"
import { cn } from "../../../lib/utils"
import { ALLOWED_LOGO_TYPES_ACCEPT, MAX_LOGO_SIZE_LABEL, ALLOWED_LOGO_TYPES_LABEL } from "../constants/logo"
import { validateLogo } from "../utils/imageValidation"

/**
 * LogoUploader
 *
 * Respects the disabled prop — when disabled, the logo is non-interactive:
 * - No hover effects
 * - No click to upload
 * - Upload button is hidden
 * - Drag-and-drop is disabled
 *
 * When enabled (not disabled):
 * - Fixed square frame; image covers the entire frame (object-cover).
 * - Click anywhere on the logo (or the camera overlay) to replace it.
 * - Drag-and-drop also supported.
 *
 * @param {Object}        props
 * @param {File|null}     props.value        - Staged File (controlled).
 * @param {Function}      props.onChange     - Called with File on valid pick, null on remove.
 * @param {string|null}   props.currentLogo  - URL of the already-saved logo.
 * @param {boolean}       props.disabled     - When true, logo is completely non-interactive.
 */
export function LogoUploader({ value, onChange, currentLogo = null, disabled = false }) {
  const { toast } = useToast()
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(currentLogo ?? null)
  const [isDragActive, setIsDragActive] = useState(false)

  // Sync preview to the staged file, falling back to server logo.
  useEffect(() => {
    if (!value) {
      setPreviewUrl(currentLogo ?? null)
      return
    }
    const objectUrl = URL.createObjectURL(value)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [value, currentLogo])

  // ── File handler ─────────────────────────────────────────────────────────

  const handleFile = useCallback(
    (file) => {
      if (!file) return
      const { valid, error } = validateLogo(file)
      if (!valid) {
        toast({ type: "error", message: "Invalid image", description: error })
        return
      }
      onChange(file)
    },
    [onChange, toast]
  )

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = "" // allow re-selecting the same file
  }

  const openFilePicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  // ── Drag and drop ────────────────────────────────────────────────────────

  const handleDragEnter = (e) => { 
    if (disabled) return
    e.preventDefault(); e.stopPropagation(); setIsDragActive(true) 
  }
  const handleDragOver  = (e) => { 
    if (disabled) return
    e.preventDefault(); e.stopPropagation(); setIsDragActive(true) 
  }
  const handleDragLeave = (e) => { 
    if (disabled) return
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false) 
  }
  const handleDrop = (e) => {
    if (disabled) return
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Remove ───────────────────────────────────────────────────────────────

  const handleRemove = (e) => {
    e.stopPropagation()
    setPreviewUrl(null)
    onChange(null)
  }

  const hasPreview = Boolean(previewUrl)

  return (
    <div className="flex flex-col items-start gap-3">
      {/* ── Fixed-size frame ───────────────────────────────────────────── */}
      <div
        role={disabled ? "img" : "button"}
        tabIndex={disabled ? -1 : 0}
        aria-label={disabled ? "Company logo" : "Upload company logo"}
        onClick={disabled ? undefined : openFilePicker}
        onKeyDown={disabled ? undefined : (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFilePicker() }
        }}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        className={cn(
          // Fixed square — always the same size regardless of content
          "relative h-28 w-28 shrink-0 overflow-hidden rounded-xl",
          "border-2 border-(--border-default) bg-(--bg-card-subtle)",
          disabled ? "select-none" : "group cursor-pointer select-none outline-none",
          // Only apply interactive styles when not disabled
          !disabled && "transition-colors duration-150",
          // Drag highlight (only when enabled)
          !disabled && isDragActive && "border-(--brand-primary) bg-(--accent-surface)",
          // Focus ring (only when enabled)
          !disabled && "focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-2"
        )}
      >
        {/* Logo image — covers the whole frame */}
        {hasPreview ? (
          <img
            src={previewUrl}
            alt="Company logo"
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : (
          // Empty state — centred camera icon (only shown when enabled)
          !disabled && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-(--text-muted)">
              <Camera className="h-6 w-6" />
              <span className="text-[10px] font-medium leading-tight text-center px-1">
                Upload logo
              </span>
            </div>
          )
        )}

        {/* Hover overlay — only shows when enabled and user hovers */}
        {!disabled && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/40 opacity-0 transition-opacity duration-150",
              "group-hover:opacity-100",
              // Also show when actively dragging
              isDragActive && "opacity-100",
            )}
            aria-hidden="true"
          >
            <Camera className="h-6 w-6 text-white drop-shadow" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id="logo-upload-input"
        type="file"
        accept={ALLOWED_LOGO_TYPES_ACCEPT}
        aria-label="Upload company logo file"
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
      />

      {/* ── Action row ─────────────────────────────────────────────────── */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={openFilePicker}
            className="flex items-center gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" />
            {hasPreview ? "Replace" : "Upload logo"}
          </Button>

          {hasPreview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-(--status-error-fg) hover:bg-(--status-error-bg)"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      )}

      {/* Hint text — only shown when enabled */}
      {!disabled && (
        <p className="text-[10px] text-(--text-muted) leading-relaxed -mt-1">
          {ALLOWED_LOGO_TYPES_LABEL} · Max {MAX_LOGO_SIZE_LABEL}
        </p>
      )}
    </div>
  )
}
