import React, { useState } from "react"
import { Link } from "react-router"
import { Menu, Moon, Sun, X } from "lucide-react"
import { useReducedMotion } from "framer-motion"
import { Button } from "../ui/button"
import { useTheme } from "../providers/theme-provider"
import { useLocale } from "../../hooks/use-locale"
import { cn } from "../../lib/utils"

const NAV_LINKS = [
  { href: "#features", labelKey: "landing.nav.features" },
  { href: "#how-it-works", labelKey: "landing.nav.howItWorks" },
  { href: "#pricing", labelKey: "landing.nav.pricing" },
  { href: "#faq", labelKey: "landing.nav.faq" },
]

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const { t, isRtl, changeLanguage } = useLocale()
  const { theme, toggleTheme } = useTheme()

  const handleSectionClick = (event, href) => {
    event.preventDefault()
    const target = document.querySelector(href)
    target?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    })
    setIsMenuOpen(false)
  }

  const toggleLanguage = () => {
    changeLanguage(isRtl ? "en" : "ar")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-(--border-default) bg-(--bg-page)/95 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--border-focus)"
        >
          <img alt="" className="h-9 w-9 shrink-0" src="/wakeel-logo.svg" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold text-(--text-primary)">
              {t("landing.brand.name")}
            </span>
            <span className="mt-1 hidden text-xs text-(--text-secondary) sm:inline">
              {t("landing.brand.tagline")}
            </span>
          </span>
        </Link>

        <nav
          aria-label={t("landing.nav.ariaLabel")}
          className="hidden items-center gap-2 lg:flex"
        >
          {NAV_LINKS.map((item) => (
            <a
              className="rounded-sm px-3 py-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--bg-card-subtle) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
              href={item.href}
              key={item.href}
              onClick={(event) => handleSectionClick(event, item.href)}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            size="md"
            onClick={toggleTheme}
            className="h-10 w-10 p-0 cursor-pointer text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-card-subtle) border border-(--border-default) rounded-sm"
            aria-label={t("topbar.toggleTheme")}
            title={t("topbar.toggleTheme")}>
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <button
            className="inline-flex h-10 min-w-16 items-center justify-center rounded-sm border border-(--border-default) bg-(--bg-card-subtle) px-3 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--bg-card) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
            onClick={toggleLanguage}
            type="button"
          >
            {isRtl ? t("topbar.englishLayout") : t("topbar.arabicLayout")}
          </button>
          <Button asChild size="md" variant="secondary">
            <Link to="/login">{t("landing.actions.signIn")}</Link>
          </Button>
          <Button asChild size="md" variant="primary">
            <Link to="/register">{t("landing.actions.getStarted")}</Link>
          </Button>
        </div>

        <button
          aria-controls="landing-mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen
              ? t("landing.actions.closeMenu")
              : t("landing.actions.openMenu")
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-(--border-default) bg-(--bg-card) text-(--text-primary) transition-colors hover:bg-(--bg-card-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus) lg:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
          type="button"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-(--border-default) bg-(--bg-card) px-4 py-4 lg:hidden",
          isMenuOpen ? "block" : "hidden",
        )}
        id="landing-mobile-menu"
      >
        <nav aria-label={t("landing.nav.mobileAriaLabel")} className="space-y-1">
          {NAV_LINKS.map((item) => (
            <a
              className="block rounded-sm px-3 py-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--bg-card-subtle) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
              href={item.href}
              key={item.href}
              onClick={(event) => handleSectionClick(event, item.href)}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>
        <div className="mt-4 grid gap-2 border-t border-(--border-default) pt-4">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 flex-1 items-center justify-center rounded-sm border border-(--border-default) bg-(--bg-card-subtle) px-3 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--bg-card) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
              onClick={toggleLanguage}
              type="button"
            >
              {isRtl ? t("topbar.englishLayout") : t("topbar.arabicLayout")}
            </button>
            <Button
              variant="ghost"
              size="md"
              onClick={toggleTheme}
              className="h-10 w-10 shrink-0 p-0 border border-(--border-default) bg-(--bg-card-subtle) cursor-pointer text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-card)"
              aria-label={t("topbar.toggleTheme")}
              title={t("topbar.toggleTheme")}>
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button asChild size="md" variant="secondary">
            <Link onClick={() => setIsMenuOpen(false)} to="/login">
              {t("landing.actions.signIn")}
            </Link>
          </Button>
          <Button asChild size="md" variant="primary">
            <Link onClick={() => setIsMenuOpen(false)} to="/register">
              {t("landing.actions.getStarted")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
