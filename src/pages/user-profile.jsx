import React, { useMemo, useEffect, useState } from "react"
import {
  Building2,
  KeyRound,
  UserRound,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/toast"
import { useApp } from "../context/app-context"
import { useAuth } from "../features/auth/hooks/use-auth"
import { getEmployees } from "../features/company/services/employee-service"
import { changePassword } from "../features/profile/services/account-service"
import {
  DetailGrid,
  DetailItem,
  ProfileSection,
} from "../features/profile/components/profile-details"
import { useLocale } from "../hooks/use-locale"
import { PageShell } from "./page-shell"

function createInitials(name) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "—"
  )
}

function getRoleTranslationKey(role) {
  const normalizedRole = role?.toLowerCase()

  if (normalizedRole === "company_owner") return "profile.roles.companyOwner"
  if (normalizedRole === "owner") return "profile.roles.owner"
  if (normalizedRole === "hr_manager") return "profile.roles.hrManager"
  if (normalizedRole === "hr & compliance lead") return "profile.roles.hrComplianceLead"
  if (normalizedRole === "hr") return "profile.roles.hr"

  return null
}

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

export function UserProfilePage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const { currentUser: authUser } = useAuth()
  const { activeCompany, currentUser: defaultUser } = useApp()
  const sourceUser = authUser || defaultUser

  const [realUserDetail, setRealUserDetail] = useState(null)

  useEffect(() => {
    if (sourceUser?.sub) {
      getEmployees()
        .then((users) => {
          const matched = users.find((u) => u.id === sourceUser.sub)
          if (matched) {
            setRealUserDetail(matched)
          }
        })
        .catch((err) => {
          console.error("Failed to load user profile details from API:", err)
        })
    }
  }, [sourceUser?.sub])

  const profile = useMemo(() => {
    const rawName = realUserDetail?.name || sourceUser?.name || sourceUser?.nameEn
    const rawEmail = realUserDetail?.email || sourceUser?.email
    const rawRole = realUserDetail?.role || sourceUser?.role

    const localizedName = isRtl
      ? rawName
      : sourceUser?.nameEn || rawName

    const companyName =
      sourceUser?.companyName ||
      (isRtl ? activeCompany?.name : activeCompany?.nameEn) ||
      ""

    const initials = createInitials(localizedName)

    return {
      fullName: localizedName || "",
      initials,
      role: rawRole || "",
      email: rawEmail || "",
      companyName,
      accountStatus: sourceUser?.accountStatus || "active",
    }
  }, [activeCompany, isRtl, sourceUser, realUserDetail])

  const fallback = t("profile.notProvided")
  const displayValue = (value) => value || fallback
  const roleKey = getRoleTranslationKey(profile.role)
  const roleLabel = roleKey ? t(roleKey) : displayValue(profile.role)
  const accountStatus = t(`profile.values.${profile.accountStatus}`, {
    defaultValue: displayValue(profile.accountStatus),
  })

  return (
    <PageShell
      eyebrow={t("profile.user.eyebrow")}
      title={t("profile.user.title")}
      description={t("profile.user.description")}
    >
      <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-6 text-start shadow-(--shadow-1)">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar
            className="h-20 w-20 border-(--border-emphasis)"
            aria-label={t("profile.user.avatarLabel", { name: displayValue(profile.fullName) })}
          >
            <AvatarFallback className="text-xl font-semibold">
              {displayValue(profile.initials)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-2xl font-semibold text-(--text-primary)">
                {displayValue(profile.fullName)}
              </h3>
              <Badge variant="legal" shape="pill">{roleLabel}</Badge>
              <Badge variant="success" shape="pill">{accountStatus}</Badge>
              <Badge variant="info" shape="pill">{t("profile.readOnlyBadge")}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-(--text-secondary)">
              <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{displayValue(profile.companyName)}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-(--text-muted)">
              {t("profile.user.readOnlyHelper")}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileSection
            icon={UserRound}
            title={t("profile.sections.personalDetails")}
            description={t("profile.sections.personalDetailsDescription")}
          >
            <DetailGrid>
              <DetailItem label={t("profile.fields.fullName")} value={displayValue(profile.fullName)} />
              <DetailItem label={t("profile.fields.initials")} value={displayValue(profile.initials)} />
              <DetailItem
                label={t("profile.fields.email")}
                value={
                  profile.email ? (
                    <a className="hover:underline" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  ) : fallback
                }
              />
              <DetailItem label={t("profile.fields.role")} value={roleLabel} />
            </DetailGrid>
          </ProfileSection>

          <ChangePasswordSection />
        </div>
      </div>
    </PageShell>
  )
}