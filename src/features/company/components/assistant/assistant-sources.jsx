import React from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../../components/ui/badge";

function formatRelevance(relevance) {
  if (relevance === null || relevance === undefined || relevance === "") return null;
  if (typeof relevance === "number") {
    return relevance <= 1 ? `${Math.round(relevance * 100)}%` : String(relevance);
  }
  return String(relevance);
}

export function AssistantSources({ sources = [] }) {
  const { t } = useTranslation();

  if (!sources.length) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase text-(--text-secondary)">
        {t("assistant.sources.title")}
      </span>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => {
          const relevance = formatRelevance(source.relevance);
          const label = source.title || source.id;
          const detailParts = [
            source.article && t("assistant.sources.article", { value: source.article }),
            source.section && t("assistant.sources.section", { value: source.section }),
            relevance && t("assistant.sources.relevance", { value: relevance }),
          ].filter(Boolean);

          const content = (
            <>
              <span className="max-w-[16rem] truncate">{label}</span>
              {source.type && (
                <Badge variant="info" shape="pill" className="h-5 px-1.5 py-0 text-[10px]">
                  {source.type}
                </Badge>
              )}
              {detailParts.length > 0 && (
                <span className="text-[10px] font-normal text-(--text-secondary)">
                  {detailParts.join(" · ")}
                </span>
              )}
              {source.url && <ExternalLink className="h-3 w-3 shrink-0" />}
            </>
          );

          if (source.url) {
            return (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-(--border-default) bg-(--bg-card) px-3 py-1 text-[11px] font-semibold text-(--brand-primary) shadow-(--shadow-1) hover:bg-(--ai-surface)"
              >
                {content}
              </a>
            );
          }

          return (
            <span
              key={source.id}
              className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-(--border-default) bg-(--bg-card) px-3 py-1 text-[11px] font-semibold text-(--brand-primary) shadow-(--shadow-1)"
            >
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}

