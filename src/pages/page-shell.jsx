import React from "react"

export function PageShell({ eyebrow, title, description, children }) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-(--bg-page)">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 p-4 pb-12 sm:gap-6 sm:p-6 sm:pb-16">
        <header className="flex flex-col gap-2 text-start">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--brand-primary)">
            {eyebrow}
          </span>
          <h2 className="wrap-break-word font-display text-2xl font-semibold leading-tight text-(--text-primary) sm:text-3xl">
            {title}
          </h2>
          <p className="wrap-break-word max-w-2xl text-sm leading-relaxed text-(--text-secondary)">
            {description}
          </p>
        </header>
        {children}
      </div>
    </main>
  )
}
