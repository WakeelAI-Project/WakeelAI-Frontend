import React from "react"
import { FileDown, Sparkles } from "lucide-react"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import { useTranslation } from "react-i18next"

export function DocumentCard({
  filename,
  fileSize,
  isAiGenerated = false,
  date,
  onDownload,
  className
}) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "rounded-md border border-(--border-default) bg-(--bg-card) p-4 flex items-center justify-between gap-4 hover:bg-(--bg-card-raised) transition-colors text-start select-none",
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-3 rounded-sm bg-(--legal-surface) text-(--legal-primary) shrink-0 font-medium">
          DOC
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-(--text-primary) truncate">
              {filename}
            </span>
            {isAiGenerated && (
              <Badge variant="ai" className="h-5 py-0 px-1.5 shrink-0 flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                <span>{t("documents.aiBadge")}</span>
              </Badge>
            )}
          </div>
          <span className="text-xs text-(--text-secondary) mt-1">
            {fileSize} • {date}
          </span>
        </div>
      </div>

      <button
        onClick={onDownload}
        type="button"
        className="p-2 hover:bg-(--bg-card-raised) rounded-full text-(--text-secondary) hover:text-(--text-primary) cursor-pointer transition-colors"
      >
        <FileDown className="h-5 w-5" />
      </button>
    </div>
  )
}
