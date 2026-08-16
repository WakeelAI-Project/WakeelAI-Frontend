import React from "react"

export function PageShell({ eyebrow, title, description, children }) {
  return (
    <main className="flex-1 overflow-y-auto bg-(--bg-page)">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 pb-16">
        <header className="flex flex-col gap-2 text-start">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--brand-primary)">
            {eyebrow}
          </span>
          <h2 className="font-display text-3xl font-semibold text-(--text-primary)">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-(--text-secondary)">
            {description}
          </p>
        </header>
        {children}
      </div>
    </main>
  )
}
