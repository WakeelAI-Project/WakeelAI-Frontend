import React from "react"
import { Calendar, User, Clock } from "lucide-react"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-md border border-(--border-default) bg-(--bg-card) p-5 flex flex-col justify-between gap-4 hover:bg-(--bg-card-raised) transition-all cursor-pointer text-start shadow-sm select-none",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm bg-(--bg-card-raised) border border-(--border-default) text-(--ai-primary) shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-(--text-primary)">
              {leaveType}
            </span>
            <span className="text-xs text-(--text-secondary) mt-0.5 flex items-center gap-1">
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

      <div className="flex items-center justify-between border-t border-(--border-default) pt-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-(--text-secondary)">{t("leave.periodLabel")}</span>
          <span className="font-medium text-(--text-primary)">
            {startDate} {t("leave.to")} {endDate}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 text-end">
          <span className="text-(--text-secondary)">{t("leave.durationLabel")}</span>
          <span className="font-medium text-(--ai-primary) flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {daysCount} {t("leave.days")}
          </span>
        </div>
      </div>
    </div>
  )
}
