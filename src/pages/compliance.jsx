import React, { useEffect, useState } from "react"
import { ComplianceCard } from "../components/legal/compliance-card"
import { Timeline } from "../components/data-display/timeline"
import { getComplianceItems } from "../features/company/services/compliance-service"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function CompliancePage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const [complianceItems, setComplianceItems] = useState([])

  useEffect(() => {
    getComplianceItems().then(setComplianceItems).catch(() => setComplianceItems([]))
  }, [])

  const steps = [
    {
      title: t("compliance.scanTitle"),
      description: t("compliance.scanDesc"),
      date: "09:30",
      isCompleted: true
    },
    {
      title: t("compliance.reviewTitle"),
      description: t("compliance.reviewDesc"),
      date: "11:10",
      isActive: true
    },
    {
      title: t("compliance.exportTitle"),
      description: t("compliance.exportDesc"),
      date: "Pending"
    }
  ]

  return (
    <PageShell
      eyebrow={t("compliance.grounding")}
      title={t("compliance.title")}
      description={t("compliance.description")}
    >
      {complianceItems.length > 0 && (
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
      )}

      <section className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-1)]">
        <Timeline items={steps} isRtl={isRtl} />
      </section>
    </PageShell>
  )
}
