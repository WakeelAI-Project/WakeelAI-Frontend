import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/use-auth";

/**
 * Reusable Guest Route Component.
 * Restricts access to guest-only pages like /login for authenticated users.
 * Automatically redirects authenticated users to their role-specific dashboard.
 */
export function GuestRoute() {
  const { isAuthenticated, currentUser } = useAuth();

  if (isAuthenticated) {
    const role = currentUser?.role?.toLowerCase() || "";

    // Scalable redirection rules based on roles
    if (role.includes("hr")) {
      return <Navigate to="/hr/dashboard" replace />;
    }
    if (role.includes("owner")) {
      return <Navigate to="/owner/dashboard" replace />;
    }

    // Default fallback for authenticated users
    return <Navigate to="/hr/dashboard" replace />;
  }

  return <Outlet />;
}
