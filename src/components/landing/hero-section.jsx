import React from "react"
import { Link } from "react-router"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Scale,
  UserRound,
} from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { SplitText } from "../react-bits/split-text"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

export function HeroSection() {
  const { t, isRtl } = useLocale()
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  return (
    <section className="relative overflow-hidden border-b border-(--border-default) bg-(--bg-page)">
      <div className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] lg:px-8 lg:py-20">
        <div className="max-w-3xl text-start">
          <Badge className="mb-5" shape="pill" variant="ai">
            {t("landing.hero.eyebrow")}
          </Badge>
          <SplitText
            className="font-display text-4xl font-semibold leading-[1.08] text-(--text-primary) sm:text-5xl lg:text-6xl"
            splitType="words"
            tag="h1"
            text={t("landing.hero.headline")}
          />
          <p className="mt-6 max-w-2xl text-base leading-8 text-(--text-secondary) sm:text-lg">
            {t("landing.hero.copy")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="ai">
              <Link to="/register">
                {t("landing.actions.getStarted")}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">{t("landing.actions.signIn")}</Link>
            </Button>
          </div>
        </div>

        <AnimatedContent className="w-full" delay={0.14} distance={18}>
          <ProductPreview />
        </AnimatedContent>
      </div>
    </section>
  )
}

function ProductPreview() {
  const { t } = useLocale()

  return (
    <div className="rounded-md border border-(--border-default) bg-(--bg-card) p-3 shadow-(--shadow-2)">
      <div className="rounded-sm border border-(--border-default) bg-(--bg-card-subtle)">
        <div className="flex items-center justify-between border-b border-(--border-default) px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-(--status-error-fg)" />
            <span className="h-2.5 w-2.5 rounded-full bg-(--status-warning-fg)" />
            <span className="h-2.5 w-2.5 rounded-full bg-(--status-success-fg)" />
          </div>
          <span className="text-xs font-semibold uppercase text-(--text-muted)">
            {t("landing.hero.preview.workspace")}
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-72 flex-col rounded-sm border border-(--border-default) bg-(--bg-card) p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-(--ai-surface) text-(--ai-primary)">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-(--text-primary)">
                  {t("landing.hero.preview.assistantTitle")}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t("landing.hero.preview.assistantStatus")}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="max-w-[86%] rounded-sm bg-(--bg-page-alt) px-3 py-2 text-(--text-secondary)">
                {t("landing.hero.preview.question")}
              </div>
              <div className="ms-auto max-w-[90%] rounded-sm border border-(--border-default) bg-(--ai-surface) px-3 py-2 text-(--text-primary)">
                {t("landing.hero.preview.answer")}
              </div>
            </div>
            <div className="mt-auto rounded-sm border border-(--border-default) bg-(--bg-card-subtle) p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-(--text-primary)">
                <Scale className="h-4 w-4 text-(--ai-primary)" />
                {t("landing.hero.preview.sourceLabel")}
              </div>
              <p className="text-xs leading-5 text-(--text-secondary)">
                {t("landing.hero.preview.source")}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <PreviewMiniCard
              icon={CalendarCheck}
              label={t("landing.hero.preview.leaveLabel")}
              title={t("landing.hero.preview.leaveTitle")}
              value={t("landing.hero.preview.leaveValue")}
            />
            <PreviewMiniCard
              icon={UserRound}
              label={t("landing.hero.preview.employeeLabel")}
              title={t("landing.hero.preview.employeeTitle")}
              value={t("landing.hero.preview.employeeValue")}
            />
            <PreviewMiniCard
              icon={FileText}
              label={t("landing.hero.preview.documentLabel")}
              title={t("landing.hero.preview.documentTitle")}
              value={t("landing.hero.preview.documentValue")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewMiniCard({ icon: Icon, label, title, value }) {
  return (
    <div className="rounded-sm border border-(--border-default) bg-(--bg-card) p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-(--legal-surface) text-(--legal-primary)">
          <Icon className="h-5 w-5" />
        </span>
        <CheckCircle2 className="h-4 w-4 text-(--status-success-fg)" />
      </div>
      <p className="text-xs font-semibold uppercase text-(--text-muted)">
        {label}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-(--text-primary)">
        {title}
      </h3>
      <p className="mt-2 text-xs leading-5 text-(--text-secondary)">{value}</p>
    </div>
  )
}
