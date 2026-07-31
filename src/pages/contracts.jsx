import React, { useEffect, useState } from "react"
import { ContractCard } from "../components/legal/contract-card"
import { DocumentPreview } from "../components/legal/document-preview"
import { getContracts } from "../features/company/services/contract-service"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function ContractsPage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const [contracts, setContracts] = useState([])

  useEffect(() => {
    getContracts().then(setContracts).catch(() => setContracts([]))
  }, [])

  return (
    <PageShell
      eyebrow={t("contracts.officialRecords")}
      title={t("contracts.title")}
      description={t("contracts.description")}
    >
      {contracts.length > 0 && (
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
      )}

      <DocumentPreview
        title={t("contracts.tempAgreement")}
        citation={t("contracts.citation")}
        content={t("contracts.content")}
      />
    </PageShell>
  )
}
