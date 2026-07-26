import React from "react"
import { DocumentCard } from "../components/legal/document-card"
import { FileUpload } from "../components/forms/file-upload"
import { documents } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"

export function DocumentsPage({ isRtl }) {
  return (
    <PageShell
      isRtl={isRtl}
      eyebrow="Document Vault"
      eyebrowAr="خزنة المستندات"
      title="Documents"
      titleAr="المستندات"
      description="A single place for official templates, uploaded files, and AI-generated drafts."
      descriptionAr="مكان واحد للنماذج الرسمية والملفات المرفوعة والمسودات المولدة بالذكاء الاصطناعي."
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

      <FileUpload label={isRtl ? "إضافة مستند جديد" : "Add New Document"} />
    </PageShell>
  )
}
