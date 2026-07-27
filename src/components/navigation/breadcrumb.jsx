import React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

export function Breadcrumb({ items = [], className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)}>
      <ol className="flex items-center gap-1.5 text-sm text-(--text-secondary)">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1

          return (
            <li key={idx} className="inline-flex items-center gap-1.5">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="hover:text-(--text-primary) transition-colors select-none"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("select-none", isLast && "font-semibold text-(--text-primary)")}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
