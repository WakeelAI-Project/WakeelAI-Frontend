import React from "react"
import { FileText, ArrowUpRight } from "lucide-react"
import { Badge } from "../ui/badge"
import { useDirection } from "../../hooks/use-direction"
import { cn } from "../../lib/utils"

export function ContractCard({
  title,
  employeeName,
  status = "Draft", // Draft, Signed, Filed
  date,
  salary,
  onViewDetails,
  className
}) {
  const { isRtl } = useDirection()

  // Fold corner clip-path based on LTR/RTL:
  // LTR: Top-Right is clipped (12px fold)
  // RTL: Top-Left is clipped (12px fold)
  const clipPathStyle = isRtl
    ? "polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12px)"
    : "polygon(0% 0%, calc(100% - 12px) 0%, 100% 12px, 100% 100%, 0% 100%)"

  return (
    <div
      onClick={onViewDetails}
      className={cn(
        "relative rounded-lg border border-(--border-default) bg-(--bg-card) hover:bg-(--bg-card-raised) transition-all cursor-pointer shadow-sm overflow-hidden flex flex-col group select-none text-start",
        className
      )}
      style={{ clipPath: clipPathStyle }}
    >
      {/* Top 4px Legal Strip */}
      <div className="h-1 bg-(--legal-primary) w-full shrink-0" />

      {/* Fold corner backing effect */}
      <div
        className={cn(
          "absolute top-0 w-3 h-3 bg-(--legal-surface) border-b border-(--border-default) shadow-sm shrink-0",
          isRtl
            ? "inset-s-0 rounded-br-xs border-r"
            : "inset-e-0 rounded-bl-xs border-l"
        )}
      />

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 mt-2">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="p-2.5 rounded-sm bg-(--legal-surface) text-(--legal-primary) shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-(--text-primary) group-hover:text-(--legal-primary) transition-colors line-clamp-1">
                {title}
              </span>
              <span className="text-xs text-(--text-secondary) mt-0.5">
                {isRtl ? `الموظف: ${employeeName}` : `Employee: ${employeeName}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-(--border-default) pt-3 text-xs shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-(--text-secondary)">{isRtl ? "تاريخ الصدور" : "Issued Date"}</span>
            <span className="font-medium text-(--text-primary)">{date}</span>
          </div>

          <div className="flex flex-col gap-0.5 text-end">
            <span className="text-(--text-secondary)">{isRtl ? "الراتب الأساسي" : "Basic Salary"}</span>
            <span className="font-mono font-medium text-(--legal-primary)">
              {salary}
            </span>
          </div>
        </div>

        {/* Footer State */}
        <div className="flex items-center justify-between mt-1 shrink-0">
          <Badge
            variant={status === "Signed" ? "success" : status === "Filed" ? "legal" : "warning"}
            shape="pill"
          >
            {status}
          </Badge>

          <span className="text-xs font-medium text-(--ai-primary) flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isRtl ? "عرض الوثيقة" : "View Contract"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  )
}
