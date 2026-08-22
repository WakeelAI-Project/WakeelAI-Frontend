import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Building2, Send, ShieldCheck, Users } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { useToast } from "../components/ui/toast"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { inviteEmployee } from "../features/company/services/employee-service"
import { listHRUsers } from "../features/company/services/user-service"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function OwnerDashboardPage() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [hrCount, setHrCount] = useState(null)
  const [hrCountLoading, setHrCountLoading] = useState(true)

  // Fetch HR count on mount
  useEffect(() => {
    const fetchHRCount = async () => {
      try {
        setHrCountLoading(true)
        const response = await listHRUsers()
        setHrCount(response.total || 0)
      } catch (error) {
        console.error("Failed to fetch HR count:", error)
        setHrCount(null)
      } finally {
        setHrCountLoading(false)
      }
    }

    fetchHRCount()
  }, [])

  const onInvite = async ({ name, email }) => {
    try {
      // POST /users/invite — sends { full_name, email, role: "HR_Manager" }
      // Backend requires the exact string "HR_Manager" (case-insensitive checked against enum)
      await inviteEmployee({ full_name: name, email, role: "HR_Manager" })
      toast({
        type: "success",
        message: t("dashboard.inviteSentMsg", { defaultValue: "Invitation sent" }),
        description: t("dashboard.inviteSentDesc", { defaultValue: "An invitation email has been sent to {{email}}.", email }),
      })
      reset({ name: "", email: "" })
      
      // Refresh HR count after successful invite
      try {
        const response = await listHRUsers()
        setHrCount(response.total || 0)
      } catch (error) {
        console.error("Failed to refresh HR count:", error)
      }
    } catch (err) {
      toast({
        type: "error",
        message: t("dashboard.inviteFailedMsg", { defaultValue: "Failed to send invitation" }),
        description: err?.message || t("common.error"),
      })
    }
  }

  const hrCountDisplay = hrCountLoading ? "..." : hrCount !== null ? hrCount.toString() : "—"

  return (
    <PageShell
      eyebrow={t("dashboard.ownerTitle")}
      title={t("dashboard.ownerTitle")}
      description={t("dashboard.ownerDesc")}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [Building2, t("dashboard.company"), t("dashboard.activeWorkspace")],
          [Users, t("dashboard.hrTeam"), hrCountDisplay],
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
          <Button type="submit" variant="primary" size="lg" className="w-full cursor-pointer md:w-auto md:self-end" isLoading={isSubmitting} loadingText={t("dashboard.sending")}>
            <Send className="h-4 w-4" />
            {t("dashboard.sendInvite")}
          </Button>
        </form>
      </section>
    </PageShell>
  )
}
