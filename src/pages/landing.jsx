import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { AiHighlightSection } from "../components/landing/ai-highlight-section"
import { FaqSection } from "../components/landing/faq-section"
import { FeaturesSection } from "../components/landing/features-section"
import { FinalCtaSection } from "../components/landing/final-cta-section"
import { HeroSection } from "../components/landing/hero-section"
import { HowItWorksSection } from "../components/landing/how-it-works-section"
import { LandingFooter } from "../components/landing/landing-footer"
import { LandingNavbar } from "../components/landing/landing-navbar"
import { PricingSection } from "../components/landing/pricing-section"
import { ValuePropositionSection } from "../components/landing/value-proposition-section"

export function LandingPage() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = t("landing.meta.title")
  }, [t])

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-primary)">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ValuePropositionSection />
        <FeaturesSection />
        <AiHighlightSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}

