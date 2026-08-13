import React from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "../../../../components/ui/button"
import { TEMPLATE_PLACEHOLDERS } from "../../templates/template-placeholders"

export function PlaceholderPalette({ onInsert, disabled = false }) {
  const { t } = useTranslation()

  return (
    <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-4 text-start shadow-(--shadow-1)">
      <h3 className="text-sm font-semibold text-(--text-primary)">
        {t("templates.placeholders.title")}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {TEMPLATE_PLACEHOLDERS.map((placeholder) => (
          <Button
            key={placeholder.key}
            type="button"
            variant="secondary"
            size="xs"
            disabled={disabled}
            onClick={() => onInsert?.(placeholder.token)}
            title={placeholder.token}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {t(placeholder.labelKey)}
          </Button>
        ))}
      </div>
    </section>
  )
}
