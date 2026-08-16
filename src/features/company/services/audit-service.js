import api from "../../../lib/api";

function normalizeAuditLog(record) {
  if (!record) return null;

  return {
    id: record.id ?? null,
    action: record.action ?? "",
    details: record.details ?? "",
    userId: record.user_id ?? record.userId ?? null,
    userIdDisplay: record.user_id ?? record.userId ?? "—",
    createdAt: record.created_at ?? record.createdAt ?? null,
    timestamp: record.created_at ?? record.createdAt ?? null,
    resourceType: record.resource_type ?? record.resourceType ?? null,
    resourceId: record.resource_id ?? record.resourceId ?? null,
  };
}

export async function getAuditEvents({
  page = 1,
  limit = 20,
  action,
  userId,
} = {}) {
  const params = { page, limit };

  if (action) params.action = action;
  if (userId) params.userId = userId;

  const { data } = await api.get("/AuditLogs", { params });

  return {
    data: (data?.data ?? []).map(normalizeAuditLog).filter(Boolean),
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    total: data?.total ?? 0,
  };
}
