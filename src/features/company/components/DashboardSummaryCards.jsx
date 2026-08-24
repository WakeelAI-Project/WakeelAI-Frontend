import React from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../../../components/data-display/stat-card";
import { cn } from "../../../lib/utils";

// ---------------------------------------------------------------------------
// Skeleton placeholder — matches the StatCard proportions
// ---------------------------------------------------------------------------
function StatCardSkeleton({ className }) {
  return (
    <div
      className={cn(
        "rounded-md border border-(--border-default) bg-paper dark:bg-(--bg-card) dark:border-(--bg-card-raised) p-5 flex flex-col gap-3 shadow-sm animate-pulse",
        className,
      )}>
      <div className="h-3 w-24 rounded bg-(--bg-disabled)" />
      <div className="h-9 w-16 rounded bg-(--bg-disabled)" />
      <div className="h-3 w-32 rounded bg-(--bg-disabled)" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual card with loading / error / value states
// ---------------------------------------------------------------------------
function SummaryCard({ title, domain, loading, error, value, description }) {
  const { t } = useTranslation();

  if (loading) {
    return <StatCardSkeleton />;
  }

  // Render the card even on error — show a dash so the layout is stable
  const displayValue = error
    ? "—"
    : value === null || value === undefined
      ? "—"
      : String(value);

  const displayDescription = error
    ? t("dashboard.summaryLoadError")
    : description;

  return (
    <StatCard
      title={title}
      value={displayValue}
      domain={domain}
      description={displayDescription}
    />
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * DashboardSummaryCards
 *
 * Renders the four summary stat cards for the HR dashboard using the backend's
 * dashboard summary contract: employee_count, pending_leave_requests,
 * employees_on_leave_today, and generated_documents_count. Where appropriate,
 * active_employees is surfaced in the employees card description without changing
 * the overall layout.
 */
export function DashboardSummaryCards({ className, summary }) {
  const { t } = useTranslation();
  const { employees, leaveRequests, documents } = summary;

  const cards = [
    {
      key: "employees",
      title: t("dashboard.summaryEmployees"),
      domain: "employee",
      loading: employees.loading,
      error: employees.error,
      value: employees.count,
      description:
        employees.active === null || employees.active === undefined
          ? t("dashboard.summaryEmployeesDesc")
          : `${t("dashboard.activeEmployees")}: ${employees.active}`,
    },
    {
      key: "leave",
      title: t("dashboard.summaryLeaveRequests"),
      domain: "leave",
      loading: leaveRequests.loading,
      error: leaveRequests.error,
      value: leaveRequests.pending,
      description: t("dashboard.summaryLeaveDesc"),
    },
    {
      key: "leave-today",
      title: t("dashboard.summaryEmployeesOnLeaveToday"),
      domain: "leave",
      loading: employees.loading,
      error: employees.error,
      value: employees.onLeaveToday,
      description: t("dashboard.summaryEmployeesOnLeaveDesc"),
    },
    {
      key: "documents",
      title: t("dashboard.summaryDocuments"),
      domain: "document",
      loading: documents.loading,
      error: documents.error,
      value: documents.count,
      description: t("dashboard.summaryDocumentsDesc"),
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map(({ key, ...card }) => (
        <SummaryCard key={key} {...card} />
      ))}
    </div>
  );
}
