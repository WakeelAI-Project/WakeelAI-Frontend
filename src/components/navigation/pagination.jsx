import React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export function Pagination({ totalPages, currentPage, onPageChange, className }) {
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="xs"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      </Button>

      {/* Pages */}
      {getPageNumbers().map((page, idx) => {
        if (typeof page === "string") {
          return (
            <div
              key={idx}
              className="flex h-8 w-8 items-center justify-center text-sm text-(--text-secondary) select-none"
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
          )
        }

        const isCurrent = page === currentPage

        return (
          <Button
            key={idx}
            variant={isCurrent ? "primary" : "ghost"}
            size="xs"
            onClick={() => onPageChange(page)}
            className={cn(
              "h-8 w-8 p-0 text-sm font-medium",
              isCurrent && "bg-(--brand-primary) text-paper hover:bg-(--brand-primary-hover)"
            )}
          >
            {page}
          </Button>
        )
      })}

      {/* Next Button */}
      <Button
        variant="ghost"
        size="xs"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </nav>
  )
}
