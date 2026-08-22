import React from "react"
import { Link } from "react-router"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

export function FinalCtaSection() {
  const { t, isRtl } = useLocale()
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  return (
    <section className="bg-(--bg-sidebar) px-4 py-16 text-(--text-on-brand) sm:px-6 sm:py-20 lg:px-8">
      <AnimatedContent className="mx-auto max-w-4xl text-center" distance={16}>
        <p className="text-sm font-semibold uppercase text-(--ai-primary)">
          {t("landing.finalCta.eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
          {t("landing.finalCta.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-(--text-muted)">
          {t("landing.finalCta.copy")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="ai">
            <Link to="/register">
              {t("landing.actions.getStarted")}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Link
            className="rounded-sm px-3 py-2 text-sm font-semibold text-(--text-on-brand) underline-offset-4 hover:underline"
            to="/login"
          >
            {t("landing.finalCta.signInPrompt")}
          </Link>
        </div>
      </AnimatedContent>
    </section>
  )
}
