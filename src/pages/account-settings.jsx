import React from "react"
import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/toast"
import { changePassword } from "../features/profile/services/account-service"
import { ProfileSection } from "../features/profile/components/profile-details"
import { PageShell } from "./page-shell"

const PASSWORD_MIN_LENGTH = 8

function ChangePasswordSection() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const newPassword = watch("new_password")

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root")
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      })
      reset({ current_password: "", new_password: "", confirm_password: "" })
      toast({
        type: "success",
        message: t("profile.security.successTitle"),
        description: t("profile.security.successDesc"),
      })
    } catch (err) {
      setError("root", {
        type: "server",
        message: err?.message || t("profile.security.failTitle"),
      })
    }
  })

  return (
    <ProfileSection
      icon={KeyRound}
      title={t("profile.security.title")}
      description={t("profile.security.description")}
    >
      <form className="grid gap-4 sm:max-w-md" onSubmit={onSubmit} noValidate>
        {errors.root?.message && (
          <div
            role="alert"
            className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)"
          >
            {errors.root.message}
          </div>
        )}

        <Input
          type="password"
          label={t("profile.security.currentPassword")}
          required
          autoComplete="current-password"
          errorText={errors.current_password?.message}
          {...register("current_password", {
            required: t("profile.security.currentRequired"),
          })}
        />

        <Input
          type="password"
          label={t("profile.security.newPassword")}
          required
          autoComplete="new-password"
          hintText={t("profile.security.newPasswordHint", { min: PASSWORD_MIN_LENGTH })}
          errorText={errors.new_password?.message}
          {...register("new_password", {
            required: t("profile.security.newRequired"),
            minLength: {
              value: PASSWORD_MIN_LENGTH,
              message: t("profile.security.newMinLength", { min: PASSWORD_MIN_LENGTH }),
            },
          })}
        />

        <Input
          type="password"
          label={t("profile.security.confirmPassword")}
          required
          autoComplete="new-password"
          errorText={errors.confirm_password?.message}
          {...register("confirm_password", {
            required: t("profile.security.confirmRequired"),
            validate: (value) =>
              value === newPassword || t("profile.security.confirmMismatch"),
          })}
        />

        <Button
          type="submit"
          className="self-start"
          isLoading={isSubmitting}
          loadingText={t("profile.actions.saving")}
        >
          {t("profile.security.submit")}
        </Button>
      </form>
    </ProfileSection>
  )
}

export function AccountSettingsPage() {
  const { t } = useTranslation()

  return (
    <PageShell
      eyebrow={t("accountSettings.eyebrow", { defaultValue: "Settings" })}
      title={t("accountSettings.title", { defaultValue: "Account Settings" })}
      description={t("accountSettings.description", { defaultValue: "Manage your account security and preferences." })}
    >
      <div className="grid gap-6">
        <ChangePasswordSection />
      </div>
    </PageShell>
  )
}
