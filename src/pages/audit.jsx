import React, { useEffect, useState } from "react"
import { ActivityFeed } from "../components/data-display/activity-feed"
import { Table } from "../components/data-display/table"
import { getAuditEvents } from "../features/company/services/audit-service"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function AuditPage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const [auditEvents, setAuditEvents] = useState([])

  useEffect(() => {
    getAuditEvents().then(setAuditEvents).catch(() => setAuditEvents([]))
  }, [])

  const rows = auditEvents.map((event) => ({
    ...event,
    displayTitle: isRtl ? event.titleAr : event.title,
    timestamp: event.time
  }))

  const columns = [
    { title: t("audit.eventCol"), key: "displayTitle", sortable: true },
    { title: t("audit.actorCol"), key: "actor", sortable: true },
    { title: t("audit.timeCol"), key: "timestamp", sortable: true }
  ]

  return (
    <PageShell
      eyebrow={t("audit.trail")}
      title={t("audit.title")}
      description={t("audit.description")}
    >
      <ActivityFeed items={rows} />
      <Table columns={columns} data={rows} />
    </PageShell>
  )
}
