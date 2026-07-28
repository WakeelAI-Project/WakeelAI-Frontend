import React from "react"
import { useForm } from "react-hook-form"
import { Building2, Send, ShieldCheck, Users } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { useToast } from "../components/ui/toast"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function OwnerDashboardPage() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const onInvite = async ({ name, email }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    toast({
      type: "info",
      message: t("dashboard.inviteDemoMsg"),
      description: t("dashboard.inviteDemoDesc", { name, email })
    })
    reset({ name: "", email: "" })
  }

  return (
    <PageShell
      eyebrow={t("dashboard.ownerTitle")}
      title={t("dashboard.ownerTitle")}
      description={t("dashboard.ownerDesc")}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [Building2, t("dashboard.company"), t("dashboard.activeWorkspace")],
          [Users, t("dashboard.hrTeam"), "4"],
          [ShieldCheck, t("dashboard.access"), t("dashboard.owner")],
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
              {t("dashboard.inviteHrUser")}
            </h3>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {t("dashboard.inviteHrDesc")}
            </p>
          </div>
          <Badge variant="info">{t("dashboard.demo")}</Badge>
        </div>

        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit(onInvite)} noValidate>
          <Input label={t("dashboard.hrNameLabel")} required errorText={errors.name?.message} {...register("name", { required: t("validation.nameRequired") })} />
          <Input
            type="email"
            label={t("dashboard.hrEmailLabel")}
            required
            errorText={errors.email?.message}
            {...register("email", {
              required: t("validation.emailRequired"),
              pattern: { value: EMAIL_PATTERN, message: t("validation.invalidEmail") },
            })}
          />
          <Button type="submit" variant="primary" size="lg" className="self-end cursor-pointer" isLoading={isSubmitting} loadingText={t("dashboard.sending")}>
            <Send className="h-4 w-4" />
            {t("dashboard.sendInvite")}
          </Button>
        </form>
      </section>
    </PageShell>
  )
}
