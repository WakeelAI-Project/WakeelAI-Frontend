import React from "react"
import { Calendar, User, Clock } from "lucide-react"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

export function LeaveCard({
  employeeName,
  leaveType,
  startDate,
  endDate,
  daysCount,
  status = "Pending", // Pending, Approved, Rejected
  statusText,
  onClick,
  className
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 flex flex-col justify-between gap-4 hover:bg-[var(--bg-card-raised)] transition-all cursor-pointer text-start shadow-sm select-none",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-card-raised)] border border-[var(--border-default)] text-[var(--ai-primary)] shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              {leaveType}
            </span>
            <span className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
              <User className="h-3 w-3 opacity-60" />
              {employeeName}
            </span>
          </div>
        </div>

        <Badge
          variant={status === "Approved" ? "success" : status === "Rejected" ? "error" : "warning"}
          shape="pill"
        >
          {statusText || status}
        </Badge>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-[var(--text-secondary)]">الفترة الزمنية</span>
          <span className="font-medium text-[var(--text-primary)]">
            {startDate} إلى {endDate}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 text-end">
          <span className="text-[var(--text-secondary)]">مدة الإجازة</span>
          <span className="font-medium text-[var(--ai-primary)] flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {daysCount} أيام
          </span>
        </div>
      </div>
    </div>
  )
}
