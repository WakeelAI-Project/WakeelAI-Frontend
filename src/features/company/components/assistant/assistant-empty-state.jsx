import React from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WakeelLogo } from "../../../../components/brand/wakeel-logo";

export function AssistantEmptyState({ onSelectPrompt }) {
  const { t } = useTranslation();
  const prompts = t("assistant.empty.prompts", { returnObjects: true });
  const promptList = Array.isArray(prompts) ? prompts : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-(--border-emphasis) bg-(--ai-surface)">
        <div className="absolute inset-0 rounded-full bg-(--ai-primary) opacity-10 animate-ink-bloom" />
        <WakeelLogo framed className="relative h-12 w-12 p-2" />
      </div>

      <div className="flex items-center gap-2 text-(--ai-primary)">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase">{t("assistant.identity")}</span>
      </div>
      <h3 className="mt-2 text-xl font-semibold text-(--text-primary)">
        {t("assistant.empty.title")}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-(--text-secondary)">
        {t("assistant.empty.description")}
      </p>

      <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
        {promptList.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="flex min-h-14 items-center gap-2 rounded-md border border-(--border-default) bg-(--bg-card) px-3 py-2 text-start text-sm font-medium text-(--text-primary) shadow-(--shadow-1) transition-colors hover:border-(--ai-primary) hover:bg-(--ai-surface)"
          >
            <HelpCircle className="h-4 w-4 shrink-0 text-(--ai-primary)" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

