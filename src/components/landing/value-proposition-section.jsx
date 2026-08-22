import React from "react"
import { BadgeCheck, Landmark, LibraryBig } from "lucide-react"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

const ICONS = [LibraryBig, BadgeCheck, Landmark]

export function ValuePropositionSection() {
  const { t } = useLocale()
  const items = t("landing.value.items", { returnObjects: true })
  const valueItems = Array.isArray(items) ? items : []

  return (
    <section className="bg-(--bg-card)">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        {valueItems.map((item, index) => {
          const Icon = ICONS[index] || LibraryBig

          return (
            <AnimatedContent delay={index * 0.05} distance={16} key={item.title}>
              <div className="h-full rounded-md border border-(--border-default) bg-(--bg-card-subtle) p-5">
                <Icon className="mb-4 h-5 w-5 text-(--ai-primary)" />
                <h2 className="text-base font-semibold text-(--text-primary)">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                  {item.description}
                </p>
              </div>
            </AnimatedContent>
          )
        })}
      </div>
    </section>
  )
}

