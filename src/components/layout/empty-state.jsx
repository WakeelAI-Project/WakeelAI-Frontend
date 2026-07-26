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
  isRtl = true,
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
          <div className="relative w-20 h-16 bg-[var(--ochre-50)] border-2 border-[var(--ochre-200)] rounded-[var(--radius-sm)] flex items-center justify-center">
            <div className="absolute top-[-8px] start-[10px] w-8 h-3.5 bg-[var(--ochre-100)] rounded-t-[var(--radius-xs)] border-t-2 border-x-2 border-[var(--ochre-200)]" />
            <div className="w-10 h-1 bg-[var(--ochre-200)] rounded-full" />
          </div>
        )}

        {illustrationType === "document" && (
          <div className="relative w-16 h-20 bg-[var(--stone-0)] border-2 border-[var(--border-emphasis)] rounded-[var(--radius-sm)] flex flex-col p-2.5 gap-2">
            <div className="w-8 h-1.5 bg-[var(--ochre-100)] rounded" />
            <div className="w-10 h-1 bg-[var(--border-default)] rounded" />
            <div className="w-6 h-1 bg-[var(--border-default)] rounded" />
            <div className="absolute top-0 end-0 w-4 h-4 bg-[var(--ochre-25)] border-b-2 border-l-2 border-[var(--border-emphasis)]" />
          </div>
        )}

        {illustrationType === "calendar" && (
          <div className="relative w-16 h-16 bg-[var(--stone-0)] border-2 border-[var(--border-emphasis)] rounded-[var(--radius-sm)] flex flex-col overflow-hidden">
            <div className="h-4 bg-[var(--bark-500)] border-b border-[var(--border-emphasis)] flex justify-between px-2 items-center">
              <div className="w-1 h-1 bg-[var(--stone-0)] rounded-full" />
              <div className="w-1 h-1 bg-[var(--stone-0)] rounded-full" />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-1 p-2">
              <div className="bg-[var(--stone-100)] rounded" />
              <div className="bg-[var(--stone-100)] rounded" />
              <div className="bg-[var(--teal-100)] rounded" />
            </div>
          </div>
        )}

        {illustrationType === "search" && (
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-[var(--border-emphasis)]" />
            <div className="w-8 h-2 bg-[var(--border-emphasis)] rounded-full rotate-45 absolute bottom-[-10px] right-[-10px]" />
          </div>
        )}

        {illustrationType === "envelope" && (
          <div className="relative w-20 h-14 bg-[var(--stone-100)] border-2 border-[var(--border-emphasis)] rounded-[var(--radius-sm)] flex items-center justify-center overflow-hidden">
            {/* Envelope flap lines */}
            <div className="absolute top-0 inset-x-0 h-0 border-t-[28px] border-t-[var(--stone-200)] border-x-[38px] border-x-transparent" />
          </div>
        )}

        {illustrationType === "offline" && (
          <div className="relative w-16 h-16 rounded-full border-4 border-dashed border-[var(--status-warning-fg)] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[var(--status-warning-fg)]" />
          </div>
        )}
      </motion.div>

      {/* Info texts */}
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
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
