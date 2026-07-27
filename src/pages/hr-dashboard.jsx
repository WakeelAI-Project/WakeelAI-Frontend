import React from "react"
import { Badge } from "../components/ui/badge"
import { StatCard } from "../components/data-display/stat-card"
import { PageShell } from "./page-shell"

export function HrDashboardPage({ isRtl }) {
  return (
    <PageShell
      eyebrow="HR Dashboard"
      eyebrowAr="لوحة الموارد البشرية"
      title="Daily HR workspace"
      titleAr="مساحة عمل الموارد البشرية"
      description="A compact page to confirm HR protected routing and give the team a clean starting point."
      descriptionAr="صفحة مختصرة لتجربة المسار المحمي الخاص بالموارد البشرية وبداية واضحة للفريق."
      isRtl={isRtl}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={isRtl ? "الموظفون النشطون" : "Active employees"} value="128" domain="employee" trend={{ value: 6, isPositive: true }} />
        <StatCard title={isRtl ? "طلبات الإجازة" : "Leave requests"} value="12" domain="leave" description={isRtl ? "3 طلبات عاجلة" : "3 urgent requests"} />
        <StatCard title={isRtl ? "عقود للمراجعة" : "Contracts to review"} value="7" domain="legal" description={isRtl ? "2 اليوم" : "2 due today"} />
      </div>

      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-(--text-primary)">
            {isRtl ? "مهام اليوم" : "Today’s queue"}
          </h3>
          <Badge variant="info">{isRtl ? "مستخدم HR" : "HR User"}</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            [isRtl ? "مراجعة عقد جديد" : "Review new contract", isRtl ? "قسم المبيعات" : "Sales team"],
            [isRtl ? "اعتماد طلب إجازة" : "Approve leave request", isRtl ? "أحمد سمير" : "Ahmed Samir"],
            [isRtl ? "تحديث ملف موظف" : "Update employee file", isRtl ? "ينقصه مستند" : "Missing document"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-sm border border-(--border-default) bg-(--bg-card-subtle) p-4">
              <p className="font-semibold text-(--text-primary)">{title}</p>
              <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
