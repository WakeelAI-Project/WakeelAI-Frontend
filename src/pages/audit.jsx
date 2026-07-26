import React from "react"
import { ActivityFeed } from "../components/data-display/activity-feed"
import { Table } from "../components/data-display/table"
import { auditEvents } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"

export function AuditPage({ isRtl }) {
  const rows = auditEvents.map((event) => ({
    ...event,
    displayTitle: isRtl ? event.titleAr : event.title,
    timestamp: event.time
  }))

  const columns = [
    { title: isRtl ? "الحدث" : "Event", key: "displayTitle", sortable: true },
    { title: isRtl ? "المنفذ" : "Actor", key: "actor", sortable: true },
    { title: isRtl ? "الوقت" : "Time", key: "timestamp", sortable: true }
  ]

  return (
    <PageShell
      isRtl={isRtl}
      eyebrow="Audit Trail"
      eyebrowAr="مسار التدقيق"
      title="Audit Log"
      titleAr="سجل التدقيق"
      description="A chronological record of AI answers, legal actions, and employee data changes."
      descriptionAr="سجل زمني لإجابات الذكاء الاصطناعي والإجراءات القانونية وتغييرات بيانات الموظفين."
    >
      <ActivityFeed items={rows} isRtl={isRtl} />
      <Table columns={columns} data={rows} />
    </PageShell>
  )
}
