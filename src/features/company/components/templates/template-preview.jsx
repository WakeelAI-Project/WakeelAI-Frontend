import React from "react";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../../components/ui/badge";
import {
  buildTemplatePreviewSegments,
  validateTemplateContent,
} from "../../templates/template-placeholders";

const SAMPLE_PREVIEW = {
  employee_name: "Ahmed Hassan",
  job_title: "Software Engineer",
  department: "Engineering",
  salary: "15,000 EGP",
  hire_date: "01/01/2026",
  contract_type: "Full-time",
  company_name: "Wakeel Company",
  date: "14/08/2026",
};

export function TemplatePreview({ content }) {
  // eslint-disable-next-line no-unused-vars
  const { t } = useTranslation();
  const segments = buildTemplatePreviewSegments(content || "");
  const unresolvedTokens = validateTemplateContent(content)
    .filter((issue) => issue.type === "unknown")
    .map((issue) => issue.token);

  const isArabicContent = /[\u0600-\u06FF]/.test(content);
  
  const normalizedSegments =
    segments.length > 0 ? segments : [{ type: "text", value: "" }];

  return (
    <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-4 text-start shadow-(--shadow-1)">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-(--border-default) pb-3">
        <div className="flex items-center gap-2">
          <FileText
            className="h-4 w-4 text-(--legal-primary)"
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-(--text-primary)">
            Live preview
          </h3>
        </div>
        {unresolvedTokens.length > 0 && (
          <Badge variant="warning" shape="pill">
            {unresolvedTokens.length} unresolved
          </Badge>
        )}
      </div>

      <div className="rounded-md border border-(--border-default) bg-paper dark:bg-(--bg-card-raised) p-2 shadow-(--shadow-1) sm:p-3">
        <div className="mx-auto max-w-190 rounded-md border border-(--border-emphasis) bg-white dark:bg-(--bg-card) p-4 shadow-inner shadow-slate-200/60 dark:shadow-none sm:p-8">
          <div className="mb-8 border-b border-(--border-emphasis) pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                  Wakeel Company
                </div>
                <div className="wrap-break-word mt-2 text-lg font-semibold text-(--text-primary) sm:text-xl">
                  Employment Agreement
                </div>
              </div>
              <div className="text-start text-[11px] text-(--text-muted) sm:text-end">
                <div>Prepared</div>
                <div className="mt-1 font-medium text-(--text-primary)">
                  {SAMPLE_PREVIEW.date}
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`space-y-5 text-[14px] leading-7 text-(--text-primary) ${isArabicContent ? 'text-right' : 'text-left'}`} 
            dir={isArabicContent ? "rtl" : "ltr"}
          >
            {normalizedSegments.length === 1 &&
            normalizedSegments[0].value === "" ? (
              <div className="flex min-h-48 items-center justify-center text-center text-sm text-(--text-secondary)">
                Your document template preview will appear here.
              </div>
            ) : (
              <div className="whitespace-pre-wrap wrap-break-word">
                {normalizedSegments.map((segment, index) => {
                  if (segment.type === "resolved") {
                    return (
                      <span
                        key={`${segment.token}-${index}`}
                        className="rounded-sm bg-emerald-50 px-1 py-0.5 font-medium text-emerald-700"
                        title={segment.token}>
                        {SAMPLE_PREVIEW[
                          segment.token
                            .replace(/[{}]/g, "")
                            .replace(/^\{\{/, "")
                            .replace(/\}\}$/, "")
                        ] || segment.value}
                      </span>
                    );
                  }

                  if (segment.type === "unresolved") {
                    return (
                      <span
                        key={`${segment.token}-${index}`}
                        className="rounded-sm border border-amber-300 bg-amber-50 px-1 py-0.5 font-mono text-amber-700">
                        {segment.value}
                      </span>
                    );
                  }

                  return (
                    <React.Fragment key={`text-${index}`}>
                      {segment.value}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
