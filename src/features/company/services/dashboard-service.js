import api from "../../../lib/api";

/**
 * Fetch the dashboard summary for the authenticated company.
 *
 * GET /api/dashboard/summary
 *
 * @returns {Promise<object>} Dashboard summary data
 */
export async function getDashboardSummary() {
  const response = await api.get("/api/dashboard/summary");
  return response.data;
}
