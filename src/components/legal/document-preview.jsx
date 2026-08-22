import React from "react"
import { Sparkles, FileText } from "lucide-react"
import { VerificationBadge } from "./verification-badge"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import { useTranslation } from "react-i18next"
import { MarkdownRenderer } from "../../features/company/components/assistant/markdown-renderer"

export function DocumentPreview({
  title,
  content,
  citation,
  isAiGenerated = false,
  showCitationFooter,
  footerLabel,
  footerActionText,
  onFooterAction,
  className
}) {
  const { t } = useTranslation()
  const shouldShowCitationFooter = showCitationFooter ?? (isAiGenerated || Boolean(citation))
  const hasTextContent = typeof content === "string" && content.trim().length > 0
  const hasRenderableContent = hasTextContent || React.isValidElement(content)

  return (
    <div
      className={cn(
        "relative flex min-h-120 flex-col gap-5 rounded-md border border-(--border-default) bg-paper p-4 text-start shadow-(--shadow-1) select-none sm:min-h-150 sm:gap-6 sm:p-8 dark:bg-(--bg-card) dark:border-(--bg-card-raised)",
        className
      )}
    >
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-default) pb-4 dark:border-(--bg-card-raised) shrink-0">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-5 w-5 text-(--accent-primary)" />
          <span className="wrap-break-word min-w-0 text-base font-semibold text-(--text-primary)">{title}</span>
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
      <div className="flex-1 overflow-y-auto pe-2 font-serif text-sm leading-relaxed text-(--text-primary)">
        {hasTextContent ? (
          <MarkdownRenderer
            text={hasTextContent ? content.replace(/(^|\n)(#{1,6})(?=[^\s#])/g, '$1$2 ') : content}
            className="document-draft-markdown space-y-4 text-sm leading-7 [&_*]:[unicode-bidi:plaintext] [&_a]:text-(--accent-primary) [&_blockquote]:border-(--border-emphasis) [&_h3]:font-sans [&_h3]:text-xl [&_h4]:font-sans [&_h4]:text-base [&_h5]:font-sans [&_h5]:text-sm [&_li]:my-1"
          />
        ) : hasRenderableContent ? (
          content
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-(--text-muted) gap-2">
            <FileText className="h-10 w-10 opacity-30" />
            <span>{t("common.noContent")}</span>
          </div>
        )}
      </div>

      {/* Citation / source footer */}
      {shouldShowCitationFooter && (
        <div className="border-t border-(--border-emphasis) dark:border-(--accent-primary-active) pt-4 bg-(--ai-surface)/40 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-(--accent-primary-active) dark:text-(--ai-primary) uppercase font-semibold tracking-wider">
              {footerLabel || t("contracts.issuedDate")}
            </span>
            <span className="text-xs text-(--text-primary) font-medium">
              {citation || t("contracts.citation")}
            </span>
          </div>
          <Button
            type="button"
            variant="ai"
            size="xs"
            className="h-8 shrink-0"
            onClick={onFooterAction}
          >
            {footerActionText || t("contracts.viewContract")}
          </Button>
        </div>
      )}
    </div>
  )
}
