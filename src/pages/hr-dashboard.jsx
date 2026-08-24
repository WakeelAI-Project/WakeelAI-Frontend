import React from "react"
import { Badge } from "../components/ui/badge"
import { PageShell } from "./page-shell"
import { DashboardSummaryCards } from "../features/company/components/DashboardSummaryCards"
import { useTranslation } from "react-i18next"
import { CalendarCheck, FileText, UsersRound } from "lucide-react"
import { Skeleton } from "../components/ui/skeleton"
import { useDashboardSummary } from "../features/company/hooks/use-dashboard-summary"

function WorkspaceStatusItem({ icon: Icon, title, description, value, loading, error }) {
  return (
    <div className="rounded-sm border border-(--border-default) bg-(--bg-card-subtle) p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-start">
          <p className="font-semibold text-(--text-primary)">{title}</p>
          <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-(--brand-primary)" aria-hidden="true" />
      </div>
      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="font-display text-2xl font-semibold text-(--text-primary)">
            {error || value === null || value === undefined ? "-" : value}
          </p>
        )}
      </div>
    </div>
  )
}

export function HrDashboardPage() {
  const { t } = useTranslation()
  const summary = useDashboardSummary()

  const workspaceStatusItems = [
    {
      key: "pending-leave",
      icon: CalendarCheck,
      title: t("dashboard.pendingApprovals"),
      description: t("dashboard.pendingApprovalsDesc"),
      value: summary.leaveRequests.pending,
      loading: summary.leaveRequests.loading,
      error: summary.leaveRequests.error,
    },
    {
      key: "on-leave-today",
      icon: UsersRound,
      title: t("dashboard.summaryEmployeesOnLeaveToday"),
      description: t("dashboard.summaryEmployeesOnLeaveDesc"),
      value: summary.employees.onLeaveToday,
      loading: summary.employees.loading,
      error: summary.employees.error,
    },
    {
      key: "generated-documents",
      icon: FileText,
      title: t("dashboard.generatedDocumentsStatus"),
      description: t("dashboard.summaryDocumentsDesc"),
      value: summary.documents.count,
      loading: summary.documents.loading,
      error: summary.documents.error,
    },
  ]

  return (
    <PageShell
      eyebrow={t("dashboard.hrTitle")}
      title={t("dashboard.hrTitle")}
      description={t("dashboard.hrDesc")}
    >
      <DashboardSummaryCards summary={summary} />

      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-(--text-primary)">
            {t("dashboard.workspaceStatus")}
          </h3>
          <Badge variant="info">{t("auth.hrUser")}</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {workspaceStatusItems.map((item) => (
            <WorkspaceStatusItem key={item.key} {...item} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
