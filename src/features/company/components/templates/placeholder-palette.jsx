import React from "react";
import { Building2, CalendarDays, FileText, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { TEMPLATE_PLACEHOLDERS } from "../../templates/template-placeholders";

const PLACEHOLDER_GROUPS = [
  {
    title: "Employee",
    icon: UserRound,
    items: [
      "employee_name",
      "job_title",
      "department",
      "salary",
      "hire_date",
      "contract_type",
    ],
  },
  {
    title: "Company",
    icon: Building2,
    items: ["company_name"],
  },
  {
    title: "Document",
    icon: CalendarDays,
    items: ["date"],
  },
];

export function PlaceholderPalette({ onInsert, disabled = false }) {
  const { t } = useTranslation();

  return (
    <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-4 text-start shadow-(--shadow-1)">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
            Fields
          </p>
          <h3 className="mt-1 text-sm font-semibold text-(--text-primary)">
            Insert variable
          </h3>
        </div>
        <FileText
          className="h-4 w-4 text-(--brand-primary)"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-4">
        {PLACEHOLDER_GROUPS.map((group) => {
          const Icon = group.icon;

          return (
            <div key={group.title} className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                <Icon className="h-3.5 w-3.5" />
                {group.title}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((key) => {
                  const placeholder = TEMPLATE_PLACEHOLDERS.find(
                    (item) => item.key === key,
                  );
                  if (!placeholder) return null;

                  return (
                    <Button
                      key={placeholder.key}
                      type="button"
                      variant="secondary"
                      size="xs"
                      disabled={disabled}
                      onClick={() => onInsert?.(placeholder.token)}
                      title={`${t(placeholder.labelKey)} — ${placeholder.token}`}
                      className="justify-start border-(--border-default) bg-(--bg-card-subtle) px-2.5 text-left">
                      <span className="truncate font-medium">
                        {t(placeholder.labelKey)}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
