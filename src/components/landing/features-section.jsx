import React from "react"
import {
  Bot,
  Building2,
  CalendarCheck,
  FileText,
  Scale,
  Users,
} from "lucide-react"
import { SpotlightCard } from "../react-bits/spotlight-card"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

const FEATURE_ICONS = [Bot, Users, CalendarCheck, Scale, FileText, Building2]

export function FeaturesSection() {
  const { t } = useLocale()
  const cards = t("landing.features.cards", { returnObjects: true })
  const features = Array.isArray(cards) ? cards : []

  return (
    <section
      className="scroll-mt-24 bg-(--bg-page) py-16 sm:py-20"
      id="features"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContent className="max-w-3xl text-start" distance={16}>
          <p className="text-sm font-semibold uppercase text-(--ai-primary)">
            {t("landing.features.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-(--text-primary) sm:text-4xl">
            {t("landing.features.title")}
          </h2>
        </AnimatedContent>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] || Bot

            return (
              <AnimatedContent
                delay={index * 0.045}
                distance={18}
                key={feature.title}
              >
                <SpotlightCard className="h-full rounded-md border border-(--border-default) bg-(--bg-card) p-5 shadow-(--shadow-1)">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-(--border-default) bg-(--ai-surface) text-(--ai-primary)">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-(--text-primary)">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                    {feature.description}
                  </p>
                </SpotlightCard>
              </AnimatedContent>
            )
          })}
        </div>
      </div>
    </section>
  )
}

