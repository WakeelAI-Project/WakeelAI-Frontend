import React from "react"
import { Bot, CheckCircle2, Quote, Scale } from "lucide-react"
import { Badge } from "../ui/badge"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

export function AiHighlightSection() {
  const { t } = useLocale()
  const points = t("landing.aiHighlight.points", { returnObjects: true })
  const safePoints = Array.isArray(points) ? points : []

  return (
    <section className="bg-(--bg-card) py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <AnimatedContent className="text-start" distance={18}>
          <Badge shape="pill" variant="legal">
            {t("landing.aiHighlight.eyebrow")}
          </Badge>
          <h2 className="mt-4 font-display text-3xl font-semibold text-(--text-primary) sm:text-4xl">
            {t("landing.aiHighlight.title")}
          </h2>
          <p className="mt-4 text-base leading-8 text-(--text-secondary)">
            {t("landing.aiHighlight.copy")}
          </p>
          <ul className="mt-6 space-y-3">
            {safePoints.map((point) => (
              <li className="flex gap-3 text-sm text-(--text-secondary)" key={point}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--status-success-fg)" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </AnimatedContent>

        <AnimatedContent delay={0.08} distance={18}>
          <div className="rounded-md border border-(--border-default) bg-(--bg-card-subtle) p-3 shadow-(--shadow-2)">
            <div className="rounded-sm border border-(--border-default) bg-(--bg-card) p-5">
              <div className="flex items-center gap-3 border-b border-(--border-default) pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-(--ai-surface) text-(--ai-primary)">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {t("landing.aiHighlight.previewTitle")}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {t("landing.aiHighlight.previewSubtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-sm bg-(--bg-page-alt) p-4 text-sm text-(--text-secondary)">
                <div className="mb-2 flex items-center gap-2 font-semibold text-(--text-primary)">
                  <Quote className="h-4 w-4 text-(--ai-primary)" />
                  {t("landing.aiHighlight.questionLabel")}
                </div>
                <p>{t("landing.aiHighlight.question")}</p>
              </div>

              <div className="mt-4 rounded-sm border border-(--border-default) bg-(--bg-card-subtle) p-4">
                <p className="text-sm leading-6 text-(--text-primary)">
                  {t("landing.aiHighlight.answer")}
                </p>
                <div className="mt-4 rounded-sm border border-(--border-default) bg-(--legal-surface) p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-(--legal-primary)">
                    <Scale className="h-4 w-4" />
                    {t("landing.aiHighlight.sourcesLabel")}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-(--text-secondary)">
                    {t("landing.aiHighlight.source")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}

