import React from "react"
import { Link } from "react-router"
import { Moon, Scale, Sun } from "lucide-react"
import { SealMark } from "../brand/seal-mark"
import { useTheme } from "../providers/theme-provider"

export function AuthLayout({ title, titleAr, description, descriptionAr, children }) {
  const { direction, theme, toggleDirection, toggleTheme } = useTheme()
  const isRtl = direction === "rtl"

  return (
    <main className="min-h-screen bg-(--bg-page) text-(--text-primary)">
      <div className="grid min-h-screen lg:grid-cols-[1fr_460px]">
        <section className="hidden bg-(--bg-sidebar) px-10 py-8 text-(--text-on-brand) lg:flex lg:flex-col lg:justify-between">
          <Link to="/login" className="flex items-center gap-3">
            <SealMark />
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-wide">Wakeel AI</span>
              <span className="mt-1 text-xs text-(--text-muted)">وكيل الذكاء الاصطناعي</span>
            </div>
          </Link>

          <div className="max-w-xl text-start">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md border border-(--brand-primary-hover) bg-(--bg-sidebar-hover)">
              <Scale className="h-6 w-6 text-paper" />
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight">
              {isRtl ? "منصة هادئة لإدارة شؤون الموظفين والامتثال." : "A focused workspace for HR and compliance operations."}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-(--text-muted)">
              {isRtl
                ? "يدخل المالك لإدارة الشركة ودعوة مسؤولي الموارد البشرية، ويدخل فريق الموارد البشرية لمتابعة العمليات اليومية."
                : "Owners manage the company workspace and HR access. HR users sign in after being invited by the owner."}
            </p>
          </div>

          <p className="text-xs text-(--text-muted)">Wakeel AI · Final project build</p>
        </section>

        <section className="flex min-h-screen flex-col bg-(--bg-card) px-6 py-6 sm:px-10">
          <div className="mb-8 flex items-center justify-between lg:justify-end">
            <Link to="/login" className="flex items-center gap-2 lg:hidden">
              <SealMark className="h-9 w-9" />
              <span className="font-display text-lg font-semibold">Wakeel AI</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="ms-auto me-2 inline-flex h-8 w-8 items-center justify-center rounded-sm border border-(--border-default) bg-(--bg-card-subtle) text-(--text-secondary) transition-colors hover:text-(--text-primary) lg:ms-0"
              aria-label={isRtl ? "تبديل المظهر" : "Toggle theme"}
              title={isRtl ? "تبديل المظهر" : "Toggle theme"}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleDirection}
              className="rounded-sm border border-(--border-default) bg-(--bg-card-subtle) px-3 py-1.5 text-xs font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)"
            >
              {isRtl ? "English" : "العربية"}
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-start">
                <h2 className="font-display text-3xl font-semibold text-(--text-primary)">
                  {isRtl ? titleAr : title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                  {isRtl ? descriptionAr : description}
                </p>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
