import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, User, FileText, Calendar, ShieldCheck, ArrowRight } from "lucide-react"
import { cn } from "../../lib/utils"

export function CommandPalette({ isOpen, onClose, onNavSelect, isRtl = true }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose() // Toggle behavior handled by parent
      }
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Mock search results that switch based on query type
  const isAiQuery = query.startsWith("أنشئ") || query.startsWith("اكتب") || query.startsWith("احسب")

  const navigationResults = [
    { label: "الموظفون → أحمد محمد", labelEn: "Employees → Ahmed Mohamed", icon: User, id: "employees" },
    { label: "العقود → عقد عمل موحد", labelEn: "Contracts → Unified Work Contract", icon: FileText, id: "contracts" },
    { label: "الامتثال → الحد الأدنى للأجور", labelEn: "Compliance → Minimum Wage", icon: ShieldCheck, id: "compliance" },
  ].filter(
    (item) =>
      item.label.includes(query) ||
      item.labelEn.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--overlay-scrim)]"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-50 w-full max-w-xl bg-[var(--color-paper)] rounded-[var(--radius-lg)] shadow-[var(--elevation-4)] border border-[var(--border-default)] dark:bg-[var(--stone-800)] dark:border-[var(--stone-700)] overflow-hidden flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center border-b border-[var(--border-default)] px-4 py-3 dark:border-[var(--stone-700)] shrink-0">
              <Search className="h-5 w-5 opacity-55 me-3 shrink-0 text-[var(--stone-500)]" />
              <input
                ref={inputRef}
                type="text"
                placeholder={isRtl ? "ابحث أو اكتب أمراً للمساعد الذكي..." : "Search or type a command..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-base text-[var(--text-primary)] placeholder:text-[var(--stone-400)] text-start"
              />
            </div>

            {/* Results Body */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {query === "" ? (
                <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                  {isRtl ? "اكتب للبدء في البحث..." : "Type to start searching..."}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {/* AI action row pinned top if matching AI signature */}
                  {(isAiQuery || query.length > 3) && (
                    <button
                      onClick={() => {
                        onNavSelect("assistant", query)
                        onClose()
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--teal-25)] hover:bg-[var(--teal-50)] text-start border border-[var(--teal-100)] dark:bg-[var(--teal-900)/30] dark:border-[var(--teal-950)] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-[var(--teal-600)] dark:text-[var(--teal-400)] shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[var(--teal-700)] dark:text-[var(--teal-300)]">
                            {isRtl ? `طلب المساعد الذكي: "${query}"` : `AI Prompt Action: "${query}"`}
                          </span>
                          <span className="text-xs text-[var(--stone-500)]">
                            {isRtl ? "صياغة أو تحليل فوري مستند إلى قانون العمل" : "Instant draft or calculation based on labor law"}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--teal-600)] dark:text-[var(--teal-400)] rtl:rotate-180" />
                    </button>
                  )}

                  {/* Navigation & Section matches */}
                  {navigationResults.length > 0 && (
                    <div className="mt-2 px-2 pb-1">
                      <span className="text-xs font-semibold text-[var(--stone-500)] uppercase tracking-wider">
                        {isRtl ? "التنقل والدفاتر" : "Navigation & Shortcuts"}
                      </span>
                    </div>
                  )}

                  {navigationResults.map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onNavSelect(item.id)
                          onClose()
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--stone-100)] dark:hover:bg-[var(--stone-700)] text-start cursor-pointer transition-colors"
                      >
                        <Icon className="h-5 w-5 text-[var(--stone-500)] shrink-0" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {isRtl ? item.label : item.labelEn}
                        </span>
                      </button>
                    )
                  })}

                  {navigationResults.length === 0 && !isAiQuery && (
                    <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                      {isRtl ? "لا توجد نتائج متطابقة" : "No matching results found"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="p-3 bg-[var(--stone-50)] border-t border-[var(--border-default)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)] text-[var(--stone-500)] text-[11px] flex gap-4 select-none shrink-0">
              <span>
                <kbd className="border rounded px-1.5 py-0.5 mr-1 font-sans">↑↓</kbd>
                {isRtl ? "للتنقل" : "to navigate"}
              </span>
              <span>
                <kbd className="border rounded px-1.5 py-0.5 mr-1 font-sans">Enter</kbd>
                {isRtl ? "للاختيار" : "to select"}
              </span>
              <span>
                <kbd className="border rounded px-1.5 py-0.5 mr-1 font-sans">ESC</kbd>
                {isRtl ? "للخروج" : "to close"}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
