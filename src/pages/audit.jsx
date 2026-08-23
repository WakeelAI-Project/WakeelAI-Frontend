import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  RefreshCcw,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { getAuditEvents } from "../features/company/services/audit-service";
import { PageShell } from "./page-shell";

const PAGE_SIZE = 20;

function humanizeAction(action = "") {
  return (
    action
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "Unknown action"
  );
}

function formatAuditDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function AuditLoadingState() {
  return (
    <div className="space-y-3 rounded-md border border-(--border-default) bg-(--bg-card) p-4 shadow-(--shadow-1)">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function AuditPage() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);
  const [actionFilter, setActionFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE });

  useEffect(() => {
    let isMounted = true;

    async function loadAuditLogs() {
      setLoading(true);
      setError(null);

      try {
        const response = await getAuditEvents({
          page,
          limit,
          action: actionFilter === "all" ? undefined : actionFilter,
          userName: userSearch || undefined,
        });

        if (!isMounted) return;
        setEvents(response?.data ?? []);
        setMeta({
          total: response?.total ?? 0,
          page: response?.page ?? page,
          limit: response?.limit ?? limit,
        });
      } catch (err) {
        if (!isMounted) return;
        setEvents([]);
        setError(err?.message || "Unable to load audit logs.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAuditLogs();
    return () => {
      isMounted = false;
    };
  }, [page, limit, actionFilter, userSearch, retryKey]);

  const actions = useMemo(() => {
    const unique = new Set(events.map((event) => event.action).filter(Boolean));
    return [...unique].sort();
  }, [events]);

  const totalPages = Math.max(
    1,
    Math.ceil((meta.total || 0) / (meta.limit || PAGE_SIZE)),
  );

  return (
    <PageShell
      eyebrow="Audit trail"
      title="Audit Log"
      description="Track user and system actions tied to the company’s HR and document workflows.">
      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 shadow-(--shadow-1)">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="w-full md:max-w-56">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-(--text-secondary)">
                Action
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {humanizeAction(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:max-w-xs">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-(--text-secondary)">
                User
              </label>
              <Input
                value={userSearch}
                onChange={(event) => {
                  setUserSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Filter by user"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRetryKey((key) => key + 1)}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <AuditLoadingState />
        ) : error ? (
          <div className="rounded-md border border-(--status-error-bg) bg-(--status-error-bg) p-4 text-start">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-(--status-error-fg)" />
              <div className="space-y-2">
                <p className="font-semibold text-(--status-error-fg)">
                  Unable to load audit logs
                </p>
                <p className="text-sm text-(--status-error-fg)">{error}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setRetryKey((key) => key + 1)}>
                  Try again
                </Button>
              </div>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-md border border-dashed border-(--border-default) bg-(--bg-card-subtle) p-10 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-(--text-muted)" />
            <p className="text-base font-semibold text-(--text-primary)">
              No audit events found
            </p>
            <p className="mt-2 text-sm text-(--text-secondary)">
              No matching activity was returned by the backend for the selected
              filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-(--border-default)">
            <div className="overflow-x-auto">
              <table className="min-w-[48rem] w-full border-collapse text-start text-sm">
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "18%" }} />
                  <col />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead className="bg-(--bg-card-raised) text-(--text-secondary)">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Resource</th>
                    <th className="px-4 py-3 font-semibold">Details</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-default) bg-(--bg-card)">
                  {events.map((event) => (
                    <tr
                      key={event.id || `${event.action}-${event.createdAt}`}
                      className="align-top hover:bg-(--bg-card-subtle)">
                      <td className="px-4 py-3">
                        <Badge
                          variant="info"
                          shape="pill"
                          className="font-medium">
                          {humanizeAction(event.action)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-(--text-primary)">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-(--text-muted)" />
                          <span className="wrap-break-word font-medium">
                            {event.userIdDisplay || "System"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-(--text-secondary)">
                        <div className="space-y-1">
                          {event.resourceType ? (
                            <p className="wrap-break-word font-medium text-(--text-primary)">
                              {event.resourceType}
                            </p>
                          ) : (
                            <p className="font-medium text-(--text-primary)">
                              —
                            </p>
                          )}
                          {event.resourceId && (
                            <p className="wrap-break-word text-xs">{event.resourceId}</p>
                          )}
                        </div>
                      </td>
                      <td className="max-w-md px-4 py-3 text-(--text-secondary)">
                        <div className="wrap-break-word">
                        {event.details || "No details provided."}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-(--text-secondary)">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Clock3 className="h-4 w-4" />
                          {formatAuditDate(event.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {meta.total > 0 && (
          <div className="mt-4 flex flex-col gap-2 border-t border-(--border-default) pt-4 text-sm text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {events.length} of {meta.total} records
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Previous
              </Button>
              <span className="min-w-16 text-center font-medium text-(--text-primary)">
                Page {page}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }>
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
