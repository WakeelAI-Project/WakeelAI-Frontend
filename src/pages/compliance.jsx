import React from "react"
import { ComplianceCard } from "../components/legal/compliance-card"
import { Timeline } from "../components/data-display/timeline"
import { complianceItems } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"

export function CompliancePage({ isRtl }) {
  const steps = [
    {
      title: isRtl ? "فحص ساعات العمل" : "Working-hours scan",
      description: isRtl ? "تمت مطابقة السجلات مع المادة 84." : "Matched attendance logs against Article 84.",
      date: "09:30",
      isCompleted: true
    },
    {
      title: isRtl ? "مراجعة الإجازات" : "Leave review",
      description: isRtl ? "توجد حالتان تحتاجان مراجعة قبل نهاية الشهر." : "Two cases need review before month end.",
      date: "11:10",
      isActive: true
    },
    {
      title: isRtl ? "تصدير التقرير" : "Export report",
      description: isRtl ? "جاهز بعد اعتماد المراجعة." : "Ready after review approval.",
      date: "Pending"
    }
  ]

  return (
    <PageShell
      isRtl={isRtl}
      eyebrow="Visible Grounding"
      eyebrowAr="الإسناد القانوني المرئي"
      title="Compliance"
      titleAr="الامتثال"
      description="Every recommendation stays tied to the exact labor-law article behind it."
      descriptionAr="كل توصية مرتبطة بالمادة القانونية التي تستند إليها."
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {complianceItems.map((item) => (
          <ComplianceCard
            key={item.id}
            articleNumber={isRtl ? item.articleNumberAr : item.articleNumber}
            title={isRtl ? item.titleAr : item.title}
            status={item.status}
            statusText={isRtl ? item.statusTextAr : item.statusText}
            description={isRtl ? item.descriptionAr : item.description}
          />
        ))}
      </section>

      <section className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-1)]">
        <Timeline items={steps} isRtl={isRtl} />
      </section>
    </PageShell>
  )
}
