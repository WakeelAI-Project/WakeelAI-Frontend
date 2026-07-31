import React, { useEffect, useState } from "react"
import { DocumentCard } from "../components/legal/document-card"
import { FileUpload } from "../components/forms/file-upload"
import { getDocuments } from "../features/company/services/document-service"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function DocumentsPage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    getDocuments().then(setDocuments).catch(() => setDocuments([]))
  }, [])

  return (
    <PageShell
      eyebrow={t("documents.vault")}
      title={t("documents.title")}
      description={t("documents.description")}
    >
      <section className="grid grid-cols-1 gap-4">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            filename={isRtl ? document.filename : document.filenameEn}
            fileSize={document.fileSize}
            date={document.date}
            isAiGenerated={document.isAiGenerated}
          />
        ))}
      </section>

      <FileUpload label={t("documents.addNewDoc")} />
    </PageShell>
  )
}
