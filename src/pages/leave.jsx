import React from "react"
import { LeaveCard } from "../components/legal/leave-card"
import { Progress } from "../components/ui/progress"
import { leaveRequests } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function LeavePage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()

  return (
    <PageShell
      eyebrow={t("leave.timeOff")}
      title={t("leave.title")}
      description={t("leave.description")}
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {leaveRequests.map((request) => (
          <LeaveCard
            key={request.id}
            employeeName={isRtl ? request.employeeName : request.employeeNameEn}
            leaveType={isRtl ? request.leaveType : request.leaveTypeEn}
            startDate={request.startDate}
            endDate={request.endDate}
            daysCount={request.daysCount}
            status={request.status}
            statusText={isRtl ? request.statusText : request.status}
          />
        ))}
      </section>

      <section className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 text-start shadow-[var(--shadow-1)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{t("leave.usageTitle")}</h3>
          <span className="font-mono text-sm text-[var(--text-secondary)]">63%</span>
        </div>
        <Progress value={63} />
      </section>
    </PageShell>
  )
}
