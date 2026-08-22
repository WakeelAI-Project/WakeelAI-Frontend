import React from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { AnimatedContent } from "../react-bits/animated-content"
import { useLocale } from "../../hooks/use-locale"

export function FaqSection() {
  const { t } = useLocale()
  const items = t("landing.faq.items", { returnObjects: true })
  const faqs = Array.isArray(items) ? items : []

  return (
    <section className="scroll-mt-24 bg-(--bg-page) py-16 sm:py-20" id="faq">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <AnimatedContent className="text-start" distance={16}>
          <p className="text-sm font-semibold uppercase text-(--ai-primary)">
            {t("landing.faq.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-(--text-primary) sm:text-4xl">
            {t("landing.faq.title")}
          </h2>
        </AnimatedContent>

        <AnimatedContent delay={0.08} distance={18}>
          <Accordion.Root className="space-y-3" collapsible type="single">
            {faqs.map((item, index) => (
              <Accordion.Item
                className="rounded-md border border-(--border-default) bg-(--bg-card)"
                key={item.question}
                value={`faq-${index}`}
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 rounded-md px-5 py-4 text-start text-base font-semibold text-(--text-primary) outline-none transition-colors hover:bg-(--bg-card-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)">
                    <span className="flex-1">{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-(--text-muted) transition-transform group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden px-5 pb-5 text-start text-sm leading-7 text-(--text-secondary) data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  {item.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </AnimatedContent>
      </div>
    </section>
  )
}
