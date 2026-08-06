import React from "react"
import { useTranslation } from "react-i18next"
import { Users, CalendarClock, Sparkles, FileText } from "lucide-react"
import { StatCard } from "../../../components/data-display/stat-card"
import { cn } from "../../../lib/utils"
import { useDashboardSummary } from "../hooks/use-dashboard-summary"

// ---------------------------------------------------------------------------
// Skeleton placeholder — matches the StatCard proportions
// ---------------------------------------------------------------------------
function StatCardSkeleton({ className }) {
  return (
    <div
      className={cn(
        "rounded-md border border-(--border-default) bg-paper dark:bg-(--bg-card) dark:border-(--bg-card-raised) p-5 flex flex-col gap-3 shadow-sm animate-pulse",
        className
      )}
    >
      <div className="h-3 w-24 rounded bg-(--bg-disabled)" />
      <div className="h-9 w-16 rounded bg-(--bg-disabled)" />
      <div className="h-3 w-32 rounded bg-(--bg-disabled)" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual card with loading / error / value states
// ---------------------------------------------------------------------------
function SummaryCard({ title, domain, icon: Icon, loading, error, value, description }) {
  const { t } = useTranslation()

  if (loading) {
    return <StatCardSkeleton />
  }

  // Render the card even on error — show a dash so the layout is stable
  const displayValue = error
    ? "—"
    : value === null || value === undefined
    ? "—"
    : String(value)

  const displayDescription = error
    ? t("dashboard.summaryLoadError")
    : description

  return (
    <StatCard
      title={title}
      value={displayValue}
      domain={domain}
      description={displayDescription}
    />
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * DashboardSummaryCards
 *
 * Renders four summary stat cards for the HR Dashboard Overview (Story #172):
 *   1. Employees  — total count from GET /employees
 *   2. Leave Requests — pending count from GET /leave-requests?status=Pending
 *   3. AI Usage   — no endpoint in API v2; displayed as "—"
 *   4. Documents  — total count from GET /documents (stub while BE is not live)
 */
export function DashboardSummaryCards({ className }) {
  const { t } = useTranslation()
  const { employees, leaveRequests, documents } = useDashboardSummary()

  const cards = [
    {
      key: "employees",
      title: t("dashboard.summaryEmployees"),
      domain: "employee",
      icon: Users,
      loading: employees.loading,
      error: employees.error,
      value: employees.total,
      description: t("dashboard.summaryEmployeesDesc"),
    },
    {
      key: "leave",
      title: t("dashboard.summaryLeaveRequests"),
      domain: "leave",
      icon: CalendarClock,
      loading: leaveRequests.loading,
      error: leaveRequests.error,
      value: leaveRequests.pending,
      description: t("dashboard.summaryLeaveDesc"),
    },
    {
      key: "ai",
      title: t("dashboard.summaryAiUsage"),
      domain: "AI",
      icon: Sparkles,
      loading: false,
      error: null,
      // AI usage analytics endpoint does not exist in API v2 (§19)
      value: null,
      description: t("dashboard.summaryAiDesc"),
    },
    {
      key: "documents",
      title: t("dashboard.summaryDocuments"),
      domain: "document",
      icon: FileText,
      loading: documents.loading,
      error: documents.error,
      value: documents.total,
      description: t("dashboard.summaryDocumentsDesc"),
    },
  ]

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card) => (
        <SummaryCard key={card.key} {...card} />
      ))}
    </div>
  )
}
