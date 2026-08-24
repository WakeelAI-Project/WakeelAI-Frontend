import React from "react"
import { Link } from "react-router"
import { Moon, Sun } from "lucide-react"
import { WakeelLogo } from "../brand/wakeel-logo"
import { useTheme } from "../providers/theme-provider"
import { useLocale } from "../../hooks/use-locale"
import { AuthHero } from "./auth-hero"
import { AnimatedWaveDivider } from "./animated-wave-divider"

export function AuthLayout({ title, description, children }) {
  const { theme, toggleDirection, toggleTheme } = useTheme()
  const { isRtl, t } = useLocale()

  return (
    <main className="min-h-screen bg-(--bg-page) text-(--text-primary) selection:bg-sky-500/20">
      <div className="grid min-h-screen lg:grid-cols-[1.18fr_1fr] xl:grid-cols-[54%_46%]">
        {/* Left Column: Visual Hero Section with Animated Organic Wave Boundary */}
        <section className="relative hidden overflow-hidden bg-[#071022] lg:flex lg:flex-col">
          <AuthHero />
          <AnimatedWaveDivider isRtl={isRtl} />
        </section>

        {/* Right Column: Authentication Form Panel */}
        <section className="relative flex min-h-screen flex-col bg-(--bg-card) px-6 py-8 sm:px-12 lg:px-12 xl:px-16 transition-colors duration-200">
          {/* Top Bar Controls */}
          <div className="mb-8 flex items-center justify-between lg:justify-end">
            <Link to="/login" className="flex items-center gap-2 lg:hidden">
              <WakeelLogo framed className="h-9 w-9 p-1.5" />
              <span className="font-display text-lg font-bold">Wakeel AI</span>
            </Link>

            <div className="ms-auto flex items-center gap-2 lg:ms-0">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-card-subtle) text-(--text-secondary) transition-colors hover:text-(--text-primary) hover:border-(--border-emphasis) cursor-pointer"
                aria-label={t("topbar.toggleTheme")}
                title={t("topbar.toggleTheme")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={toggleDirection}
                className="rounded-md border border-(--border-default) bg-(--bg-card-subtle) px-3 py-1.5 text-xs font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary) hover:border-(--border-emphasis) cursor-pointer"
              >
                {isRtl ? t("topbar.englishLayout") : t("topbar.arabicLayout")}
              </button>
            </div>
          </div>

          {/* Form Content Wrapper */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[420px]">
              <div className="mb-7 text-start">
                <h2 className="font-display text-3xl sm:text-[34px] font-bold tracking-tight text-(--text-primary)">
                  {title}
                </h2>
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
                    {description}
                  </p>
                )}
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
