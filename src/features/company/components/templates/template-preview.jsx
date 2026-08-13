import React from "react"
import { FileText } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "../../../../components/ui/badge"
import {
  buildTemplatePreviewSegments,
  validateTemplateContent,
} from "../../templates/template-placeholders"

export function TemplatePreview({ content }) {
  const { t } = useTranslation()
  const segments = buildTemplatePreviewSegments(content)
  const unresolvedTokens = validateTemplateContent(content)
    .filter((issue) => issue.type === "unknown")
    .map((issue) => issue.token)

  return (
    <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-(--border-default) pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-(--legal-primary)" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-(--text-primary)">
            {t("templates.preview.title")}
          </h3>
        </div>
        {unresolvedTokens.length > 0 && (
          <Badge variant="warning" shape="pill">
            {t("templates.preview.unresolvedCount", { count: unresolvedTokens.length })}
          </Badge>
        )}
      </div>

      <div className="min-h-72 rounded-sm border border-(--border-default) bg-paper p-5 font-serif text-sm leading-relaxed text-(--text-primary) shadow-inner dark:bg-(--bg-card)">
        {segments.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center text-center text-sm text-(--text-secondary)">
            {t("templates.preview.empty")}
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {segments.map((segment, index) => {
              if (segment.type === "resolved") {
                return (
                  <span
                    key={`${segment.token}-${index}`}
                    className="rounded-xs bg-(--status-success-bg) px-1 text-(--status-success-fg)"
                    title={segment.token}
                  >
                    {segment.value}
                  </span>
                )
              }

              if (segment.type === "unresolved") {
                return (
                  <span
                    key={`${segment.token}-${index}`}
                    className="rounded-xs border border-(--status-warning-fg) bg-(--status-warning-bg) px-1 font-mono text-(--status-warning-fg)"
                  >
                    {segment.value}
                  </span>
                )
              }

              return <React.Fragment key={`text-${index}`}>{segment.value}</React.Fragment>
            })}
          </div>
        )}
      </div>
    </section>
  )
}
