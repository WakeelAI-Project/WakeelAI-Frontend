import React from "react"
import { Link } from "react-router"
import { useReducedMotion } from "framer-motion"
import { WakeelLogo } from "../brand/wakeel-logo"
import { useLocale } from "../../hooks/use-locale"

const FOOTER_LINKS = [
  { href: "#features", labelKey: "landing.nav.features" },
  { href: "#pricing", labelKey: "landing.nav.pricing" },
  { href: "#faq", labelKey: "landing.nav.faq" },
  { href: "/login", labelKey: "landing.actions.signIn", route: true },
]

export function LandingFooter() {
  const { t } = useLocale()
  const shouldReduceMotion = useReducedMotion()

  const handleSectionClick = (event, href) => {
    if (href.startsWith("/")) return

    event.preventDefault()
    document.querySelector(href)?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    })
  }

  return (
    <footer className="border-t border-(--border-default) bg-(--bg-card)">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--border-focus)"
          >
            <WakeelLogo className="h-8 w-8" />
            <span className="font-display text-lg font-semibold text-(--text-primary)">
              {t("landing.brand.name")}
            </span>
          </Link>
          <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
            {t("landing.footer.description")}
          </p>
        </div>

        <nav
          aria-label={t("landing.footer.ariaLabel")}
          className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-(--text-secondary)"
        >
          {FOOTER_LINKS.map((item) =>
            item.route ? (
              <Link
                className="rounded-sm hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
                key={item.href}
                to={item.href}
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <a
                className="rounded-sm hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
                href={item.href}
                key={item.href}
                onClick={(event) => handleSectionClick(event, item.href)}
              >
                {t(item.labelKey)}
              </a>
            ),
          )}
          <span className="text-(--text-muted)">{t("landing.footer.privacy")}</span>
          <span className="text-(--text-muted)">{t("landing.footer.terms")}</span>
        </nav>
      </div>
      <div className="border-t border-(--border-default) px-4 py-4 text-center text-xs text-(--text-muted)">
        {t("landing.footer.copyright")}
      </div>
    </footer>
  )
}
