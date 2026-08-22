import React, { useState } from "react"
import { Link } from "react-router"
import { Check } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { SegmentedControl } from "../ui/segmented-control"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

export function PricingSection() {
  const { t } = useLocale()
  const [billing, setBilling] = useState("yearly")
  const includes = t("landing.pricing.includes", { returnObjects: true })
  const includedFeatures = Array.isArray(includes) ? includes : []
  const isYearly = billing === "yearly"
  const price = isYearly ? "$300" : "$30"

  return (
    <section
      className="scroll-mt-24 border-y border-(--border-default) bg-(--bg-card) py-16 sm:py-20"
      id="pricing"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.86fr_1fr] lg:px-8">
        <AnimatedContent className="max-w-2xl text-start" distance={16}>
          <p className="text-sm font-semibold uppercase text-(--ai-primary)">
            {t("landing.pricing.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-(--text-primary) sm:text-4xl">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-4 text-base leading-8 text-(--text-secondary)">
            {t("landing.pricing.subtitle")}
          </p>
        </AnimatedContent>

        <AnimatedContent delay={0.08} distance={18}>
          <div className="rounded-md border border-(--border-emphasis) bg-(--bg-card-subtle) p-5 shadow-(--shadow-2)">
            <div className="flex flex-col gap-4 border-b border-(--border-default) pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-(--text-primary)">
                    {t("landing.pricing.planTitle")}
                  </h3>
                  {isYearly && (
                    <Badge shape="pill" variant="ai">
                      {t("landing.pricing.bestValue")}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  {t("landing.pricing.planDescription")}
                </p>
              </div>
              <SegmentedControl
                className="w-full sm:w-auto"
                name="landing-pricing"
                onChange={setBilling}
                options={[
                  { value: "monthly", label: t("landing.pricing.monthly") },
                  { value: "yearly", label: t("landing.pricing.yearly") },
                ]}
                value={billing}
              />
            </div>

            <div className="py-6">
              <p className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <bdi
                  className="font-display text-5xl font-semibold text-(--text-primary)"
                  dir="ltr"
                >
                  {price}
                </bdi>
                <span className="pb-2 text-sm font-semibold text-(--text-secondary)">
                  {isYearly
                    ? t("landing.pricing.perYear")
                    : t("landing.pricing.perMonth")}
                </span>
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {includedFeatures.map((feature) => (
                <li className="flex gap-3 text-sm text-(--text-secondary)" key={feature}>
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--ai-surface) text-(--ai-primary)">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="mt-6 w-full" size="lg" variant="primary">
              <Link to="/register">{t("landing.actions.getStarted")}</Link>
            </Button>
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}
