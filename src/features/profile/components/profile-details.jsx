import React from "react"
import { cn } from "../../../lib/utils"

export function ProfileSection({ icon: Icon, title, description, children, className }) {
  return (
    <section
      className={cn(
        "rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)",
        className
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-(--official-surface) text-(--legal-primary)">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        )}
        <div>
          <h3 className="font-display text-lg font-semibold text-(--text-primary)">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-(--text-secondary)">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

export function DetailGrid({ children, className }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-5 sm:grid-cols-2", className)}>
      {children}
    </dl>
  )
}

export function DetailItem({ label, value, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-medium leading-relaxed text-(--text-primary)">
        {value}
      </dd>
    </div>
  )
}

export function formatProfileDate(value, language, fallback) {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat(language?.startsWith("ar") ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}
