import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/use-auth";

/**
 * Reusable Protected Route Component.
 * Checks if the user is authenticated. If not, redirects to the redirect path (defaults to /login).
 * Supports checking roles (e.g. ['hr', 'owner']) for scalable role-based routes in the future.
 * 
 * @param {object} props
 * @param {string[]} [props.allowedRoles] - Optional list of roles allowed to access this route
 * @param {string} [props.redirectTo] - Route to redirect to if unauthenticated
 */
export function ProtectedRoute({ allowedRoles, redirectTo = "/login" }) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = currentUser?.role && allowedRoles.some(
      (role) => role.toLowerCase() === currentUser.role.toLowerCase()
    );

    if (!hasRole) {
      // Redirect to unauthorized or fallback route depending on role
      if (currentUser?.role?.toLowerCase().includes("hr")) {
        return <Navigate to="/hr/dashboard" replace />;
      }
      if (currentUser?.role?.toLowerCase().includes("owner")) {
        return <Navigate to="/owner/dashboard" replace />;
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
}
