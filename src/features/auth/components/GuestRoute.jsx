import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/use-auth";
import { dashboardPathForRole } from "../utils/roles";
import { ForbiddenPage } from "../../../pages/errors/forbidden";

/**
 * Reusable Guest Route Component.
 * Restricts access to guest-only pages like /login for authenticated users.
 * Redirects authenticated users to their role-specific dashboard.
 *
 * There is deliberately NO catch-all redirect: a session whose role has no web
 * console (Employee — mobile only) is cleared here and the login outlet is
 * rendered with an explanatory notice, instead of being bounced at a dashboard
 * that its own guard would bounce straight back.
 */
export function GuestRoute() {
  const { isAuthenticated, currentUser, clearAuth } = useAuth();
  const location = useLocation();
  const [unsupportedRole, setUnsupportedRole] = useState(false);

  const target = isAuthenticated
    ? dashboardPathForRole(currentUser?.role)
    : null;
  const hasUnsupportedSession = isAuthenticated && !target;

  useEffect(() => {
    if (!hasUnsupportedSession) return;
    setUnsupportedRole(true);
    clearAuth();
  }, [hasUnsupportedSession, clearAuth]);

  if (isAuthenticated) {
    // Unsupported role: clearAuth() is running in the effect above, render
    // nothing for this one tick rather than navigating anywhere.
    if (!target) return null;

    // Hard loop-breaker: never navigate to the path we are already on.
    if (target === location.pathname) return <ForbiddenPage />;

    return <Navigate to={target} replace />;
  }

  return (
    <Outlet
      context={{
        authNotice: unsupportedRole ? "auth.employeeMobileOnly" : null,
      }}
    />
  );
}
