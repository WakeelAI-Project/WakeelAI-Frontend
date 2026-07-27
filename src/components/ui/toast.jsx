import React, { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react"
import { cn } from "../../lib/utils"

const ToastContext = createContext(undefined)

const toastIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
}

const toastBorders = {
  success: "border-s-(--status-success-fg)",
  warning: "border-s-(--status-warning-fg)",
  error: "border-s-(--status-error-fg)",
  info: "border-s-(--status-info-fg)",
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, description, type = "info", duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, description, type, duration }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 start-6 z-50 flex flex-col gap-3 max-w-sm w-full select-none pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = toastIcons[t.type || "info"]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                layout
                className={cn(
                  "pointer-events-auto w-full bg-(--bg-card) text-(--bg-card-raised) rounded-md p-4 shadow-(--shadow-3) border-s-4 flex items-start gap-3 justify-between",
                  toastBorders[t.type || "info"]
                )}
              >
                <div className="flex gap-3 text-start">
                  <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", {
                    "text-(--status-success-fg)": t.type === "success",
                    "text-(--status-warning-fg)": t.type === "warning",
                    "text-(--status-error-fg)": t.type === "error",
                    "text-(--status-info-fg)": t.type === "info",
                  })} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{t.message}</span>
                    {t.description && (
                      <span className="text-xs text-(--text-muted) leading-relaxed">
                        {t.description}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-(--text-muted) hover:text-(--bg-card-raised) rounded-full p-1 cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
