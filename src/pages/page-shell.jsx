import React from "react"

export function PageShell({ eyebrow, eyebrowAr, title, titleAr, description, descriptionAr, isRtl, children }) {
  return (
    <main className="flex-1 overflow-y-auto bg-[var(--bg-page)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 pb-16">
        <header className="flex flex-col gap-2 text-start">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ai-primary)]">
            {isRtl ? eyebrowAr : eyebrow}
          </span>
          <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
            {isRtl ? titleAr : title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            {isRtl ? descriptionAr : description}
          </p>
        </header>
        {children}
      </div>
    </main>
  )
}
