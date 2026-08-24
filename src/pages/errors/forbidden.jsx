import React from "react";
import { Link, useNavigate } from "react-router";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../features/auth/hooks/use-auth";
import { dashboardPathForRole } from "../../features/auth/utils/roles";

/**
 * Static 403 page.
 *
 * Rendered by /403 and also rendered *in place* by the route guards whenever the
 * redirect target they computed equals the path they are already on — that is
 * the hard loop-breaker: a guard never navigates to itself.
 */
export function ForbiddenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();

  const dashboardPath = isAuthenticated
    ? dashboardPathForRole(currentUser?.role)
    : null;

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--bg-page) px-6 py-12 text-(--text-primary)">
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-md border border-(--border-emphasis) bg-(--bg-card-subtle)">
          <ShieldAlert className="h-7 w-7 text-(--status-warning-fg)" />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            {t("errors.forbiddenTitle")}
          </h1>
          <p className="text-sm leading-relaxed text-(--text-secondary)">
            {t("errors.forbiddenDescription")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {dashboardPath && (
            <Button asChild variant="primary" size="md">
              <Link to={dashboardPath}>{t("errors.backToDashboard")}</Link>
            </Button>
          )}
          <Button variant="secondary" size="md" onClick={handleSignOut}>
            {t("errors.signOut")}
          </Button>
        </div>
      </div>
    </main>
  );
}
