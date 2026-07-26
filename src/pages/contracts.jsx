import React from "react"
import { ContractCard } from "../components/legal/contract-card"
import { DocumentPreview } from "../components/legal/document-preview"
import { contracts } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"

export function ContractsPage({ isRtl }) {
  return (
    <PageShell
      isRtl={isRtl}
      eyebrow="Official Records"
      eyebrowAr="السجلات الرسمية"
      title="Contracts"
      titleAr="العقود"
      description="Draft, verify, and file employment agreements with a clear official/legal treatment."
      descriptionAr="صياغة ومراجعة وحفظ عقود العمل بلغة رسمية واضحة."
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
        isRtl={isRtl}
        title={isRtl ? "مسودة عقد عمل مؤقت" : "Temporary Employment Agreement"}
        citation={isRtl ? "المادة 84 · قانون العمل 12/2003" : "Article 84 · Labor Law 12/2003"}
        content={
          isRtl
            ? "بموجب هذه الوثيقة يلتزم الطرفان ببنود العمل المؤقت، مع مراعاة حدود ساعات العمل والأجر والإجازات المنصوص عليها في قانون العمل المصري.\n\nالمادة الأولى: طبيعة العمل\nيكلف الموظف بمهام استشارية لمدة ثلاثة أشهر قابلة للتجديد بموافقة الطرفين."
            : "Under this agreement, both parties commit to the temporary employment terms while respecting Egyptian Labor Law limits on working hours, pay, and leave.\n\nArticle One: Scope of Work\nThe employee is assigned consulting duties for three months, renewable by mutual consent."
        }
      />
    </PageShell>
  )
}
