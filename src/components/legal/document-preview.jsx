import React from "react"
import { Sparkles, FileText, Download } from "lucide-react"
import { VerificationBadge } from "./verification-badge"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export function DocumentPreview({
  title,
  content,
  citation,
  isAiGenerated = false,
  isRtl = true,
  className
}) {
  return (
    <div
      className={cn(
        "relative rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--stone-0)] shadow-[var(--elevation-1)] p-8 flex flex-col gap-6 dark:bg-[var(--stone-900)] dark:border-[var(--stone-800)] text-start min-h-[600px] select-none",
        className
      )}
    >
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4 dark:border-[var(--stone-800)] shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--ochre-600)]" />
          <span className="font-semibold text-base text-[var(--text-primary)]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isAiGenerated && (
            <div className="hidden sm:flex items-center gap-1 text-[var(--teal-600)] bg-[var(--teal-25)] px-2 py-0.5 rounded-[var(--radius-xs)] text-xs border border-[var(--teal-100)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>مستودع بالذكاء الاصطناعي</span>
            </div>
          )}
          <VerificationBadge isRtl={isRtl} />
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto pr-2 font-serif text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap font-sans dark:text-[var(--stone-200)]">
        {content || (
          <div className="h-full flex flex-col items-center justify-center text-[var(--stone-400)] gap-2">
            <FileText className="h-10 w-10 opacity-30" />
            <span>{isRtl ? "لا يوجد محتوى للمستند" : "No document content"}</span>
          </div>
        )}
      </div>

      {/* Citation / Source Footer (Mandatory when AI-generated) */}
      {(isAiGenerated || citation) && (
        <div className="border-t border-[var(--teal-100)] dark:border-[var(--teal-800)] pt-4 bg-[var(--teal-25)]/40 p-4 rounded-[var(--radius-md)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-[var(--teal-700)] dark:text-[var(--teal-300)] uppercase font-semibold tracking-wider">
              {isRtl ? "مرجع السند القانوني" : "Legal Citation Reference"}
            </span>
            <span className="text-xs text-[var(--text-primary)] font-medium">
              {citation || (isRtl ? "المادة ١٠٣ من قانون العمل رقم ١٤ لسنة ٢٠٢٥" : "Article 103 of Labor Law No. 14 of 2025")}
            </span>
          </div>
          <Button variant="ai" size="xs" className="h-8 shrink-0">
            {isRtl ? "عرض السند في القانون" : "View Article"}
          </Button>
        </div>
      )}
    </div>
  )
}
