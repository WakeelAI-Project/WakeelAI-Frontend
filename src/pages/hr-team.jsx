import React, { useEffect, useState } from "react"
import { Users } from "lucide-react"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { listHRUsers } from "../features/company/services/user-service"

/**
 * HR Team Page (Owner Only)
 * 
 * Displays the list of HR Manager users for the authenticated company.
 * Uses GET /api/users?role=HR_Manager endpoint.
 */
export function HrTeamPage() {
  const { t } = useTranslation()
  const [hrUsers, setHrUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHRUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await listHRUsers()
        setHrUsers(response.data || [])
      } catch (err) {
        console.error("Failed to fetch HR users:", err)
        setError(err.message || t("common.error"))
      } finally {
        setLoading(false)
      }
    }

    fetchHRUsers()
  }, [t])

  return (
    <PageShell
      eyebrow={t("hrTeam.eyebrow", { defaultValue: "Team Management" })}
      title={t("hrTeam.title", { defaultValue: "HR Team" })}
      description={t("hrTeam.description", { defaultValue: "View and manage your company's HR managers." })}
    >
      <div className="rounded-md border border-(--border-default) bg-(--bg-card) shadow-(--shadow-1)">
        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-(--brand-primary) border-r-transparent"></div>
            <p className="mt-4 text-sm text-(--text-secondary)">
              {t("hrTeam.loading", { defaultValue: "Loading HR team..." })}
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--status-error-bg)">
              <Users className="h-6 w-6 text-(--status-error-fg)" />
            </div>
            <h3 className="text-lg font-semibold text-(--text-primary)">
              {t("hrTeam.errorTitle", { defaultValue: "Failed to load HR team" })}
            </h3>
            <p className="mt-2 text-sm text-(--text-secondary)">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-(--brand-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--brand-primary-hover) transition-colors cursor-pointer"
            >
              {t("common.retry", { defaultValue: "Retry" })}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hrUsers.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-card-subtle)">
              <Users className="h-6 w-6 text-(--text-muted)" />
            </div>
            <h3 className="text-lg font-semibold text-(--text-primary)">
              {t("hrTeam.emptyTitle", { defaultValue: "No HR managers yet" })}
            </h3>
            <p className="mt-2 text-sm text-(--text-secondary)">
              {t("hrTeam.emptyDescription", { defaultValue: "Invite your first HR manager from the dashboard." })}
            </p>
          </div>
        )}

        {/* Table State */}
        {!loading && !error && hrUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-(--border-default) bg-(--bg-card-subtle)">
                  <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
                    {t("hrTeam.nameColumn", { defaultValue: "Name" })}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
                    {t("hrTeam.roleColumn", { defaultValue: "Role" })}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
                    {t("hrTeam.statusColumn", { defaultValue: "Status" })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-default)">
                {hrUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-(--bg-card-subtle) transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-(--text-primary)">
                      {user.full_name || t("common.unknown", { defaultValue: "Unknown" })}
                    </td>
                    <td className="px-6 py-4 text-sm text-(--text-secondary)">
                      {user.role || "HR_Manager"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={
                          user.is_active
                            ? "inline-flex items-center rounded-full bg-(--status-success-bg) px-2.5 py-0.5 text-xs font-semibold text-(--status-success-fg)"
                            : "inline-flex items-center rounded-full bg-(--status-warning-bg) px-2.5 py-0.5 text-xs font-semibold text-(--status-warning-fg)"
                        }
                      >
                        {user.is_active
                          ? t("hrTeam.active", { defaultValue: "Active" })
                          : t("hrTeam.inactive", { defaultValue: "Inactive" })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}
