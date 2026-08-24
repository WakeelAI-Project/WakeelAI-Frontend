/**
 * Single source of truth for mapping a backend role string onto the two roles
 * that have a web console: Company_Owner and HR_Manager.
 *
 * The employee experience is mobile-only — an Employee role deliberately maps
 * to `null` here so no web area is ever resolved for it.
 */

/**
 * Resolves a raw role claim to "owner", "hr", or null (no web console).
 *
 * @param {string|null|undefined} role
 * @returns {"owner"|"hr"|null}
 */
export function resolveWebRole(role) {
  const normalized = (role || "").toLowerCase();
  if (!normalized) return null;
  // Owner is checked first: no owner role string contains "hr".
  if (normalized.includes("owner")) return "owner";
  if (normalized.includes("hr")) return "hr";
  return null;
}

/**
 * Returns the dashboard path for a role, or null when the role has no web area.
 *
 * @param {string|null|undefined} role
 * @returns {string|null}
 */
export function dashboardPathForRole(role) {
  const webRole = resolveWebRole(role);
  if (webRole === "owner") return "/owner/dashboard";
  if (webRole === "hr") return "/hr/dashboard";
  return null;
}
