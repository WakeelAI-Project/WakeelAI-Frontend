import React, { useEffect } from "react"
import { AnimatePresence, motion, useDragControls, useMotionValue } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export function BottomSheet({ isOpen, onClose, children, title, className }) {
  const y = useMotionValue(0)
  const dragControls = useDragControls()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleDragEnd = (event, info) => {
    if (info.offset.y > 120 || info.velocity.y > 600) {
      onClose()
    } else {
      y.set(0)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--overlay-scrim)]"
          />

          {/* Sheet Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragControls={dragControls}
            dragListener={false}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className={cn(
              "relative z-50 w-full max-w-lg bg-[var(--color-paper)] rounded-t-[var(--radius-xl)] shadow-[var(--elevation-4)] border-t border-[var(--border-default)] flex flex-col max-h-[85vh] dark:bg-[var(--stone-800)] dark:border-[var(--stone-700)] overflow-hidden",
              className
            )}
          >
            {/* Drag Handle Bar */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing select-none shrink-0"
            >
              <div className="w-10 h-1 rounded-full bg-[var(--stone-300)] dark:bg-[var(--stone-600)]" />
            </div>

            {/* Header */}
            {(title || onClose) && (
              <div className="px-5 pb-3 flex items-center justify-between border-b border-[var(--border-default)] dark:border-[var(--stone-700)] shrink-0">
                {title ? (
                  <h3 className="text-base font-semibold text-[var(--text-primary)] text-start">
                    {title}
                  </h3>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 hover:bg-[var(--stone-100)] text-[var(--stone-500)] hover:text-[var(--text-primary)] dark:hover:bg-[var(--stone-700)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content area */}
            <div className="overflow-y-auto p-5 pb-8 flex-1 text-start">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
