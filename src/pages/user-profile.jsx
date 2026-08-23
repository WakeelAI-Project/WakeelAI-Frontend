import React, { useMemo, useEffect, useState } from "react"
import {
  Building2,
  UserRound,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { useApp } from "../context/app-context"
import { useAuth } from "../features/auth/hooks/use-auth"
import { getCurrentUserProfile } from "../features/profile/services/user-service"
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

// eslint-disable-next-line no-unused-vars
const PASSWORD_MIN_LENGTH = 8

export function UserProfilePage() {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const { currentUser: authUser } = useAuth()
  const { activeCompany, currentUser: defaultUser } = useApp()
  const sourceUser = authUser || defaultUser

  const [realUserDetail, setRealUserDetail] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState(null)

  // GET /api/users/me is the profile source for BOTH HR managers and owners.
  // (The old owner branch keyed off `sourceUser.sub`, a claim this JWT never
  // carries, so no request was ever fired and every field rendered "—".)
  useEffect(() => {
    let cancelled = false

    setIsLoadingProfile(true)
    setProfileError(null)

    getCurrentUserProfile()
      .then((profile) => {
        if (cancelled || !profile) return
        // Map API response to internal structure
        setRealUserDetail({
          id: profile.user_id,
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          isActive: profile.is_active,
          createdAt: profile.created_at,
          companyId: profile.company_id,
        })
      })
      .catch((err) => {
        if (cancelled) return
        console.error("Failed to load profile from /api/users/me:", err)
        setProfileError(err?.message || "Failed to load profile")
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const profile = useMemo(() => {
    const rawName = realUserDetail?.name || sourceUser?.name || sourceUser?.nameEn
    const rawEmail = realUserDetail?.email || sourceUser?.email
    const rawPhone = realUserDetail?.phone
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
      phone: rawPhone || "",
      companyName,
      accountStatus: realUserDetail?.isActive !== undefined 
        ? (realUserDetail.isActive ? "active" : "inactive")
        : (sourceUser?.accountStatus || "active"),
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
      {isLoadingProfile && (
        <div
          className="flex flex-col gap-6"
          aria-busy="true"
          aria-label={t("common.loading")}
        >
          <div className="rounded-md border border-(--border-default) bg-(--bg-card) p-6 shadow-(--shadow-1)">
            <div className="flex gap-5">
              <div className="h-20 w-20 rounded-full animate-skeleton shrink-0" />
              <div className="flex-1 flex flex-col gap-3 pt-2">
                <div className="h-6 w-48 rounded animate-skeleton" />
                <div className="h-4 w-32 rounded animate-skeleton" />
              </div>
            </div>
          </div>
          <div className="h-48 rounded-md animate-skeleton" />
        </div>
      )}

      {!isLoadingProfile && profileError && (
        <div
          role="alert"
          className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg) mb-4"
        >
          {profileError}
        </div>
      )}

      {!isLoadingProfile && !profileError && (
        <>
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
                  {profile.phone && (
                    <DetailItem label={t("profile.fields.phone")} value={displayValue(profile.phone)} />
                  )}
                  <DetailItem label={t("profile.fields.role")} value={roleLabel} />
                </DetailGrid>
              </ProfileSection>
            </div>
          </div>
        </>
      )}
    </PageShell>
  )
}