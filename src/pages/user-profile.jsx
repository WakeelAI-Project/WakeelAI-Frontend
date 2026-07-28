import React, { useMemo } from "react"
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { useApp } from "../context/app-context"
import { getMockUserProfile } from "../data/mock/profile"
import { useAuth } from "../features/auth/hooks/use-auth"
import {
  DetailGrid,
  DetailItem,
  formatProfileDate,
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

export function UserProfilePage() {
  const { t } = useTranslation()
  const { language, isRtl } = useLocale()
  const { currentUser: authUser } = useAuth()
  const { activeCompany, currentUser: defaultUser } = useApp()
  const sourceUser = authUser || defaultUser

  const profile = useMemo(() => {
    const mockProfile = getMockUserProfile(sourceUser?.role)
    const localizedFallbackName = isRtl
      ? sourceUser?.name || sourceUser?.nameEn
      : sourceUser?.nameEn || sourceUser?.name

    return {
      ...mockProfile,
      fullName: localizedFallbackName || mockProfile.fullName,
      initials:
        sourceUser?.initials ||
        createInitials(localizedFallbackName || mockProfile.fullName),
      role: sourceUser?.role || mockProfile.role,
      email: sourceUser?.email || mockProfile.email,
      phone: sourceUser?.phone || mockProfile.phone,
      companyName:
        sourceUser?.companyName ||
        (isRtl ? activeCompany?.name : activeCompany?.nameEn) ||
        mockProfile.companyName,
    }
  }, [activeCompany, isRtl, sourceUser])

  const fallback = t("profile.notProvided")
  const displayValue = (value) => value || fallback
  const roleKey = getRoleTranslationKey(profile.role)
  const roleLabel = roleKey ? t(roleKey) : displayValue(profile.role)
  const accountStatus = t(`profile.values.${profile.accountStatus}`, {
    defaultValue: displayValue(profile.accountStatus),
  })

  const recentActivity = [
    { id: "login", icon: LogIn, label: t("profile.activity.loggedIn"), time: t("profile.activity.today") },
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: t("profile.activity.viewedDashboard"),
      time: t("profile.activity.recently"),
    },
  ]

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
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
              <DetailItem label={t("profile.fields.phone")} value={displayValue(profile.phone)} />
            </DetailGrid>
          </ProfileSection>

          <ProfileSection
            icon={Briefcase}
            title={t("profile.sections.workDetails")}
            description={t("profile.sections.workDetailsDescription")}
          >
            <DetailGrid>
              <DetailItem label={t("profile.fields.role")} value={roleLabel} />
              <DetailItem
                label={t("profile.fields.jobTitle")}
                value={t(`profile.jobTitles.${profile.jobTitle}`, {
                  defaultValue: displayValue(profile.jobTitle),
                })}
              />
              <DetailItem
                label={t("profile.fields.department")}
                value={t(`profile.departments.${profile.department}`, {
                  defaultValue: displayValue(profile.department),
                })}
              />
              <DetailItem label={t("profile.fields.companyName")} value={displayValue(profile.companyName)} />
              <DetailItem
                label={t("profile.fields.joinDate")}
                value={formatProfileDate(profile.joinDate, language, fallback)}
              />
              <DetailItem label={t("profile.fields.accountStatus")} value={accountStatus} />
              <DetailItem
                label={t("profile.fields.lastLogin")}
                value={t(`profile.activity.${profile.lastLogin}`, {
                  defaultValue: displayValue(profile.lastLogin),
                })}
              />
            </DetailGrid>
          </ProfileSection>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <ProfileSection
            icon={ShieldCheck}
            title={t("profile.sections.permissions")}
            description={t("profile.sections.permissionsDescription")}
          >
            <ul className="space-y-3">
              {profile.permissions.map((permission) => (
                <li
                  key={permission}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-(--text-primary)"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-(--status-success-fg)"
                    aria-hidden="true"
                  />
                  <span>
                    {t(`profile.permissions.${permission}`, {
                      defaultValue: permission,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </ProfileSection>

          <ProfileSection icon={Clock3} title={t("profile.sections.recentActivity")}>
            <ol className="space-y-4">
              {recentActivity.map(({ id, icon: ActivityIcon, label, time }) => (
                <li key={id} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-card-raised) text-(--text-secondary)">
                    <ActivityIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-(--text-primary)">{label}</p>
                    <p className="mt-0.5 text-xs text-(--text-muted)">{time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </ProfileSection>
        </aside>
      </div>
    </PageShell>
  )
}
