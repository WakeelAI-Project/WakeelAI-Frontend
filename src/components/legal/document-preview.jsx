import React from "react"
import { Sparkles, FileText } from "lucide-react"
import { VerificationBadge } from "./verification-badge"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import { useTranslation } from "react-i18next"
import { useLocale } from "../../hooks/use-locale"

export function DocumentPreview({
  title,
  content,
  citation,
  isAiGenerated = false,
  className
}) {
  const { t } = useTranslation()
  const { isRtl } = useLocale()

  return (
    <div
      className={cn(
        "relative rounded-lg border border-(--border-default) bg-paper shadow-(--shadow-1) p-8 flex flex-col gap-6 dark:bg-(--bg-card) dark:border-(--bg-card-raised) text-start min-h-150 select-none",
        className
      )}
    >
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-(--border-default) pb-4 dark:border-(--bg-card-raised) shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-(--accent-primary)" />
          <span className="font-semibold text-base text-(--text-primary)">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isAiGenerated && (
            <div className="hidden sm:flex items-center gap-1 text-(--ai-primary) bg-(--ai-surface) px-2 py-0.5 rounded-xs text-xs border border-(--border-emphasis)">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("documents.aiBadge")}</span>
            </div>
          )}
          <VerificationBadge />
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto pr-2 font-serif text-(--text-primary) text-sm leading-relaxed whitespace-pre-wrap dark:text-(--bg-disabled)">
        {content || (
          <div className="h-full flex flex-col items-center justify-center text-(--text-muted) gap-2">
            <FileText className="h-10 w-10 opacity-30" />
            <span>{t("common.noContent")}</span>
          </div>
        )}
      </div>

      {/* Citation / Source Footer (Mandatory when AI-generated) */}
      {(isAiGenerated || citation) && (
        <div className="border-t border-(--border-emphasis) dark:border-(--accent-primary-active) pt-4 bg-(--ai-surface)/40 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-(--accent-primary-active) dark:text-(--ai-primary) uppercase font-semibold tracking-wider">
              {t("contracts.issuedDate")}
            </span>
            <span className="text-xs text-(--text-primary) font-medium">
              {citation || t("contracts.citation")}
            </span>
          </div>
          <Button variant="ai" size="xs" className="h-8 shrink-0">
            {t("contracts.viewContract")}
          </Button>
        </div>
      )}
    </div>
  )
}
