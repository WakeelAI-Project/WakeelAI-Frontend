import React from "react"
import { ContractCard } from "../components/legal/contract-card"
import { DocumentPreview } from "../components/legal/document-preview"
import { contracts } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function ContractsPage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()

  return (
    <PageShell
      eyebrow={t("contracts.officialRecords")}
      title={t("contracts.title")}
      description={t("contracts.description")}
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.id}
            title={isRtl ? contract.title : contract.titleEn}
            employeeName={isRtl ? contract.employeeName : contract.employeeNameEn}
            status={contract.status}
            date={contract.date}
            salary={contract.salary}
          />
        ))}
      </section>

      <DocumentPreview
        title={t("contracts.tempAgreement")}
        citation={t("contracts.citation")}
        content={t("contracts.content")}
      />
    </PageShell>
  )
}
