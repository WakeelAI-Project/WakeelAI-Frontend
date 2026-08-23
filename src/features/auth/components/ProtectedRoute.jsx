import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/use-auth";
import { ForbiddenPage } from "../../../pages/errors/forbidden";

/**
 * Reusable Protected Route Component.
 * Checks if the user is authenticated. If not, redirects to the redirect path (defaults to /login).
 * Supports checking roles (e.g. ['hr', 'owner']) for scalable role-based routes.
 *
 * IMPORTANT: Blocks access to protected routes when mustChangePassword is true.
 * Users with mustChangePassword=true must complete password change before accessing the app.
 *
 * `redirectTo` (/login) is used ONLY on the unauthenticated branch. An
 * authenticated user who simply lacks the role lands on /403 — sending them back
 * to /login would bounce off GuestRoute and spin.
 *
 * @param {object} props
 * @param {string[]} [props.allowedRoles] - Optional list of roles allowed to access this route
 * @param {string} [props.redirectTo] - Route to redirect to if unauthenticated
 */
export function ProtectedRoute({ allowedRoles, redirectTo = "/login" }) {
  const { isAuthenticated, currentUser, mustChangePassword } = useAuth();
  const location = useLocation();

  // Hard loop-breaker: never navigate to the path we are already on.
  const goTo = (target) =>
    target === location.pathname ? (
      <ForbiddenPage />
    ) : (
      <Navigate to={target} replace />
    );

  if (!isAuthenticated) {
    return goTo(redirectTo);
  }

  // Block access to protected routes if password change is required
  if (mustChangePassword) {
    return goTo("/change-password");
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole =
      currentUser?.role &&
      allowedRoles.some(
        (role) => role.toLowerCase() === currentUser.role.toLowerCase(),
      );

    if (!hasRole) {
      // Redirect to the caller's own area when they have one...
      if (currentUser?.role?.toLowerCase().includes("owner")) {
        return goTo("/owner/dashboard");
      }
      if (currentUser?.role?.toLowerCase().includes("hr")) {
        return goTo("/hr/dashboard");
      }
      // ...otherwise this is an authorization failure, not a login problem.
      return goTo("/403");
    }
  }

  return <Outlet />;
}
