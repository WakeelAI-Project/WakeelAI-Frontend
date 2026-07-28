import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Calendar, FileText, Search, ShieldCheck, Sparkles, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLocale } from "../../hooks/use-locale"

export function CommandPalette({ isOpen, onClose, onOpen, onNavSelect }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef(null)
  const { t } = useTranslation()
  const { isRtl } = useLocale()

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        if (isOpen) onClose()
        else onOpen?.()
      }
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, onOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      setQuery("")
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const isAiQuery =
    query.startsWith("أنشئ") ||
    query.startsWith("اكتب") ||
    query.startsWith("احسب") ||
    query.toLowerCase().startsWith("draft") ||
    query.toLowerCase().startsWith("calculate")

  const navigationResults = [
    { labelKey: "sidebar.employees", labelText: "الموظفون - أحمد محمد", labelTextEn: "Employees - Ahmed Mohamed", icon: User, id: "employees" },
    { labelKey: "sidebar.contracts", labelText: "العقود - عقد عمل موحد", labelTextEn: "Contracts - Unified Work Contract", icon: FileText, id: "contracts" },
    { labelKey: "sidebar.leave", labelText: "الإجازات - رصيد سنوي", labelTextEn: "Leave - Annual Balance", icon: Calendar, id: "leave" },
    { labelKey: "sidebar.compliance", labelText: "الامتثال - الحد الأقصى لساعات العمل", labelTextEn: "Compliance - Working Hours Limit", icon: ShieldCheck, id: "compliance" }
  ].filter(
    (item) =>
      item.labelText.includes(query) ||
      item.labelTextEn.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-(--overlay-scrim)"
          />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="relative z-50 w-full max-w-xl bg-(--bg-card) rounded-lg shadow-(--shadow-4) border border-(--border-default) overflow-hidden flex flex-col"
          >
            <div className="flex items-center border-b border-(--border-default) px-4 py-3 shrink-0">
              <Search className="h-5 w-5 opacity-55 me-3 shrink-0 text-(--text-muted)" />
              <input
                ref={inputRef}
                type="text"
                placeholder={isRtl ? "ابحث أو اكتب أمرا للمساعد الذكي..." : "Search or type a command..."}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-base text-(--text-primary) placeholder:text-(--text-muted) text-start"
              />
            </div>

            <div className="max-h-90 overflow-y-auto p-2">
              {query === "" ? (
                <div className="p-4 text-center text-sm text-(--text-secondary)">
                  {isRtl ? "اكتب للبدء في البحث..." : "Type to start searching..."}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {(isAiQuery || query.length > 3) && (
                    <button
                      onClick={() => {
                        onNavSelect("assistant", query)
                        onClose()
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-md bg-(--ai-surface) hover:border-(--ai-primary) text-start border border-(--border-emphasis) cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-(--ai-primary) shrink-0" />
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold text-(--brand-primary)">
                            {isRtl ? `طلب المساعد الذكي: "${query}"` : `AI prompt action: "${query}"`}
                          </span>
                          <span className="text-xs text-(--text-secondary)">
                            {isRtl ? "صياغة أو تحليل مستند إلى قانون العمل" : "Draft or analyze with labor-law grounding"}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-(--ai-primary) rtl:rotate-180" />
                    </button>
                  )}

                  {navigationResults.length > 0 && (
                    <div className="mt-2 px-2 pb-1">
                      <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                        {isRtl ? "التنقل والاختصارات" : "Navigation & Shortcuts"}
                      </span>
                    </div>
                  )}

                  {navigationResults.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavSelect(item.id)
                          onClose()
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-(--bg-page-alt) text-start cursor-pointer transition-colors"
                      >
                        <Icon className="h-5 w-5 text-(--text-muted) shrink-0" />
                        <span className="text-sm font-medium text-(--text-primary)">
                          {isRtl ? item.labelText : item.labelTextEn}
                        </span>
                      </button>
                    )
                  })}

                  {navigationResults.length === 0 && !isAiQuery && (
                    <div className="p-8 text-center text-sm text-(--text-secondary)">
                      {isRtl ? "لا توجد نتائج مطابقة" : "No matching results found"}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-(--bg-card-subtle) border-t border-(--border-default) text-(--text-muted) text-[11px] flex gap-4 select-none shrink-0">
              <span>
                <kbd className="border rounded px-1.5 py-0.5 me-1 font-sans">Enter</kbd>
                {isRtl ? "للاختيار" : "to select"}
              </span>
              <span>
                <kbd className="border rounded px-1.5 py-0.5 me-1 font-sans">Esc</kbd>
                {isRtl ? "للخروج" : "to close"}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
