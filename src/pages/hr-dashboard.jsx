import React from "react"
import { Badge } from "../components/ui/badge"
import { StatCard } from "../components/data-display/stat-card"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"

export function HrDashboardPage() {
  const { t } = useTranslation()

  return (
    <PageShell
      eyebrow={t("dashboard.hrTitle")}
      title={t("dashboard.hrTitle")}
      description={t("dashboard.hrDesc")}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={t("dashboard.activeEmployees")} value="128" domain="employee" trend={{ value: 6, isPositive: true }} />
        <StatCard title={t("dashboard.leaveRequests")} value="12" domain="leave" description={t("dashboard.urgentRequests")} />
        <StatCard title={t("dashboard.contractsToReview")} value="7" domain="legal" description={t("dashboard.dueToday")} />
      </div>

      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-(--text-primary)">
            {t("dashboard.todayQueue")}
          </h3>
          <Badge variant="info">{t("auth.hrUser")}</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            [t("dashboard.reviewNewContract"), t("dashboard.salesTeam")],
            [t("dashboard.approveLeaveRequest"), t("dashboard.ahmedSamir")],
            [t("dashboard.updateEmployeeFile"), t("dashboard.missingDocument")],
          ].map(([title, description]) => (
            <div key={title} className="rounded-sm border border-(--border-default) bg-(--bg-card-subtle) p-4">
              <p className="font-semibold text-(--text-primary)">{title}</p>
              <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
