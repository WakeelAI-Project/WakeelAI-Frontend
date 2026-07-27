import React from "react"
import { useForm } from "react-hook-form"
import { Building2, Send, ShieldCheck, Users } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { useToast } from "../components/ui/toast"
import { PageShell } from "./page-shell"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function OwnerDashboardPage({ isRtl }) {
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const onInvite = async ({ name, email }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    toast({
      type: "info",
      message: isRtl ? "نموذج دعوة تجريبي فقط" : "Demo invitation only",
      description: isRtl
        ? `سيحتاج إرسال دعوة حقيقية إلى backend وخدمة بريد. تمت محاكاة دعوة ${name} على ${email}.`
        : `A real invitation needs backend and email support. Simulated invite for ${name} at ${email}.`,
    })
    reset({ name: "", email: "" })
  }

  return (
    <PageShell
      eyebrow="Owner Dashboard"
      eyebrowAr="لوحة المالك"
      title="Company control center"
      titleAr="مركز إدارة الشركة"
      description="Use this page to test owner-only routing and the frontend-only HR invitation flow."
      descriptionAr="استخدم هذه الصفحة لتجربة مسار المالك ونموذج دعوة الموارد البشرية التجريبي."
      isRtl={isRtl}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [Building2, isRtl ? "الشركة" : "Company", isRtl ? "مساحة نشطة" : "Active workspace"],
          [Users, isRtl ? "فريق الموارد البشرية" : "HR team", "4"],
          [ShieldCheck, isRtl ? "الصلاحيات" : "Access", isRtl ? "مالك" : "Owner"],
        ].map(([Icon, label, value]) => (
          <div key={label} className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
            <Icon className="mb-4 h-5 w-5 text-(--brand-primary)" />
            <p className="text-sm text-(--text-secondary)">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-(--text-primary)">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-(--text-primary)">
              {isRtl ? "دعوة مستخدم موارد بشرية" : "Invite HR user"}
            </h3>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {isRtl
                ? "هذا نموذج واجهة فقط. إرسال الدعوات الفعلي يحتاج backend."
                : "This is frontend-only for now. Sending real invitations needs backend support."}
            </p>
          </div>
          <Badge variant="info">{isRtl ? "تجريبي" : "Stub"}</Badge>
        </div>

        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit(onInvite)} noValidate>
          <Input label={isRtl ? "اسم HR" : "HR name"} required errorText={errors.name?.message} {...register("name", { required: isRtl ? "الاسم مطلوب" : "Name is required" })} />
          <Input
            type="email"
            label={isRtl ? "بريد HR" : "HR email"}
            required
            errorText={errors.email?.message}
            {...register("email", {
              required: isRtl ? "البريد الإلكتروني مطلوب" : "Email is required",
              pattern: { value: EMAIL_PATTERN, message: isRtl ? "أدخل بريداً إلكترونياً صالحاً" : "Enter a valid email address" },
            })}
          />
          <Button type="submit" variant="primary" size="lg" className="self-end" isLoading={isSubmitting} loadingText={isRtl ? "إرسال..." : "Sending..."}>
            <Send className="h-4 w-4" />
            {isRtl ? "إرسال دعوة" : "Send invite"}
          </Button>
        </form>
      </section>
    </PageShell>
  )
}
