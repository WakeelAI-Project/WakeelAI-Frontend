import React from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export function EmptyState({
  title,
  description,
  illustrationType = "folder", // folder, document, calendar, search, envelope, offline
  actionText,
  onActionClick,
  isRtl: _isRtl = true,
  className
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center select-none max-w-sm mx-auto", className)}>
      {/* Paper-cutout vector representation using CSS/HTML shapes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20, mass: 3 }}
        className="w-32 h-32 flex items-center justify-center relative mb-6 shrink-0"
      >
        {illustrationType === "folder" && (
          <div className="relative w-20 h-16 bg-(--accent-surface) border-2 border-(--border-emphasis) rounded-sm flex items-center justify-center">
            <div className="absolute -top-2 inset-s-2.5 w-8 h-3.5 bg-(--accent-surface) rounded-t-xs border-t-2 border-x-2 border-(--border-emphasis)" />
            <div className="w-10 h-1 bg-(--border-emphasis) rounded-full" />
          </div>
        )}

        {illustrationType === "document" && (
          <div className="relative w-16 h-20 bg-paper border-2 border-(--border-emphasis) rounded-sm flex flex-col p-2.5 gap-2">
            <div className="w-8 h-1.5 bg-(--accent-surface) rounded" />
            <div className="w-10 h-1 bg-(--border-default) rounded" />
            <div className="w-6 h-1 bg-(--border-default) rounded" />
            <div className="absolute top-0 inset-e-0 w-4 h-4 bg-(--accent-surface) border-b-2 border-l-2 border-(--border-emphasis)" />
          </div>
        )}

        {illustrationType === "calendar" && (
          <div className="relative w-16 h-16 bg-paper border-2 border-(--border-emphasis) rounded-sm flex flex-col overflow-hidden">
            <div className="h-4 bg-(--brand-primary) border-b border-(--border-emphasis) flex justify-between px-2 items-center">
              <div className="w-1 h-1 bg-paper rounded-full" />
              <div className="w-1 h-1 bg-paper rounded-full" />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-1 p-2">
              <div className="bg-(--bg-page-alt) rounded" />
              <div className="bg-(--bg-page-alt) rounded" />
              <div className="bg-(--border-emphasis) rounded" />
            </div>
          </div>
        )}

        {illustrationType === "search" && (
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-(--border-emphasis)" />
            <div className="w-8 h-2 bg-(--border-emphasis) rounded-full rotate-45 absolute -bottom-2.5 -right-2.5" />
          </div>
        )}

        {illustrationType === "envelope" && (
          <div className="relative w-20 h-14 bg-(--bg-page-alt) border-2 border-(--border-emphasis) rounded-sm flex items-center justify-center overflow-hidden">
            {/* Envelope flap lines */}
            <div className="absolute top-0 inset-x-0 h-0 border-t-28 border-t-(--bg-disabled) border-x-38 border-x-transparent" />
          </div>
        )}

        {illustrationType === "offline" && (
          <div className="relative w-16 h-16 rounded-full border-4 border-dashed border-(--status-warning-fg) flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-(--status-warning-fg)" />
          </div>
        )}
      </motion.div>

      {/* Info texts */}
      <h3 className="text-sm font-semibold text-(--text-primary) mb-1">
        {title}
      </h3>
      <p className="text-xs text-(--text-secondary) leading-relaxed mb-4">
        {description}
      </p>

      {/* Action Button */}
      {actionText && onActionClick && (
        <Button variant="primary" size="sm" onClick={onActionClick} className="px-5">
          {actionText}
        </Button>
      )}
    </div>
  )
}
