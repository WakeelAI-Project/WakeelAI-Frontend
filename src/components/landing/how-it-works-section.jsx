import React from "react"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

export function HowItWorksSection() {
  const { t } = useLocale()
  const steps = t("landing.howItWorks.steps", { returnObjects: true })
  const safeSteps = Array.isArray(steps) ? steps : []

  return (
    <section
      className="scroll-mt-24 bg-(--bg-page) py-16 sm:py-20"
      id="how-it-works"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContent className="max-w-3xl text-start" distance={16}>
          <p className="text-sm font-semibold uppercase text-(--ai-primary)">
            {t("landing.howItWorks.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-(--text-primary) sm:text-4xl">
            {t("landing.howItWorks.title")}
          </h2>
        </AnimatedContent>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {safeSteps.map((step, index) => (
            <AnimatedContent
              delay={index * 0.06}
              distance={18}
              key={step.title}
            >
              <div className="h-full rounded-md border border-(--border-default) bg-(--bg-card) p-5 shadow-(--shadow-1)">
                <span className="font-mono text-xs font-semibold text-(--ai-primary)">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-(--text-primary)">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                  {step.description}
                </p>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  )
}

