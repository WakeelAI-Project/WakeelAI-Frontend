import React from "react"
import { Link } from "react-router"
import { ShieldCheck, Sparkles, UsersRound } from "lucide-react"
import { useTranslation } from "react-i18next"
import { WakeelLogo } from "../brand/wakeel-logo"
import loginHeroImage from "../../assets/images/login-hero.jpg"

/**
 * AuthHero
 * Reusable hero section for authentication pages, matching the Wakeel AI
 * legal-tech atmosphere, branding, badge, typography, feature list, and local visual asset.
 */
export function AuthHero() {
  const { t } = useTranslation()

  const features = [
    {
      id: "feature-1",
      icon: UsersRound,
      title: t("auth.feature1Title", "HR & Owner Focused"),
      desc: t("auth.feature1Desc", "Built for your daily legal needs"),
    },
    {
      id: "feature-2",
      icon: ShieldCheck,
      title: t("auth.feature2Title", "100% Compliant"),
      desc: t("auth.feature2Desc", "Aligned with Egyptian Labor Law"),
    },
    {
      id: "feature-3",
      icon: Sparkles,
      title: t("auth.feature3Title", "AI Legal Assistant"),
      desc: t("auth.feature3Desc", "Ask. Get answers. Take action."),
    },
  ]

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col justify-between overflow-hidden bg-[#071022] px-8 py-8 text-white sm:px-12 sm:py-10 lg:px-14 lg:py-12">
      {/* Background Image Layer (Strictly local asset) */}
      <img
        src={loginHeroImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
        draggable="false"
      />

      {/* Cinematic Navy Gradients & Atmosphere Overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#071022]/95 via-[#071022]/80 to-[#071022]/85"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_25%,rgba(56,189,248,0.18),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071022] via-transparent to-[#071022]/40"
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-start">
        {/* Brand Header */}
        <Link to="/login" className="inline-flex items-center gap-3 transition-opacity hover:opacity-95">
          <WakeelLogo framed className="h-10 w-10 p-1.5" />
          <div className="flex flex-col text-start leading-none">
            <span className="font-display text-2xl font-bold tracking-tight text-white">Wakeel AI</span>
            <span className="mt-1 text-xs text-sky-200/70 font-medium">{t("common.subTitle")}</span>
          </div>
        </Link>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 my-auto max-w-xl py-8 text-start">
        {/* Security & Compliance Pill Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-[#0b1c38]/70 px-3.5 py-1.5 text-xs font-medium text-sky-200 backdrop-blur-md shadow-sm">
          <ShieldCheck className="h-4 w-4 text-sky-400" />
          <span>{t("auth.heroBadge", "Secure. Compliant. Intelligent.")}</span>
        </div>

        {/* Large Headline with Accent */}
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[42px] lg:leading-[1.18]">
          {t("auth.heroHeadlinePart1", "AI-Powered Legal")}{" "}
          <span className="text-[#d4a455] drop-shadow-sm">
            {t("auth.heroHeadlineAccent", "Intelligence")}
          </span>{" "}
          {t("auth.heroHeadlinePart2", "for HR")}
        </h1>

        {/* Supporting Description */}
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/90 sm:text-base">
          {t(
            "auth.heroDescription",
            "Empowering HR teams and company owners with smart legal insights, compliant documents, and seamless management."
          )}
        </p>

        {/* 3 Compact Feature Items */}
        <div className="mt-8 flex flex-col gap-4">
          {features.map(({ id, icon: Icon, title, desc }) => (
            <div key={id} className="group flex items-center gap-3.5 text-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-500/25 bg-[#0e2142]/80 text-sky-400 shadow-inner backdrop-blur-md transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-wide">{title}</span>
                <span className="text-xs text-slate-400">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Footer */}
      <div className="relative z-10 pt-4 text-start">
        <p className="text-xs font-medium text-slate-400/80">
          {t("auth.footerText", "Wakeel AI • Final project build")}
        </p>
      </div>
    </div>
  )
}
