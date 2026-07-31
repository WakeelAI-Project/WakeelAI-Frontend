import React, { useEffect, useState } from "react"
import { BookOpen, Briefcase, Landmark, Mail, Pencil, Save, ShieldCheck, X } from "lucide-react"
import { LogoUploader } from "../features/company/components/LogoUploader"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/toast"
import { useApp } from "../context/app-context"
import { getCompanyProfile, updateCompanyProfile } from "../features/company/services/profile-service"
import { useAuth } from "../features/auth/hooks/use-auth"
import {
  DetailGrid,
  DetailItem,
  formatProfileDate,
  ProfileSection,
} from "../features/profile/components/profile-details"
import { useLocale } from "../hooks/use-locale"
import { PageShell } from "./page-shell"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidWebsite(value) {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function isOwnerRole(role) {
  return ["owner", "company_owner"].includes(role?.toLowerCase())
}

// Default empty company shape — populated from backend on load
const EMPTY_COMPANY = {
  id: null,
  name: "",
  legalName: "",
  taxId: "",
  industry: "",
  size: "",
  headquarters: "",
  email: "",
  phone: "",
  website: "",
  workingHours: "",
  createdAt: null,
  ownerName: "",
  policyStatus: "",
  policyUpdatedAt: null,
  accountStatus: "active",
  logoUrl: null,
}

export function CompanyProfilePage() {
  const { t } = useTranslation()
  const { language } = useLocale()
  const { toast } = useToast()
  const { currentUser: authUser } = useAuth()
  const { activeCompany, currentUser: defaultUser } = useApp()
  const currentUser = authUser || defaultUser
  const canEdit = isOwnerRole(currentUser?.role)
  const [isEditing, setIsEditing] = useState(false)
  const [logo, setLogo] = useState(null) // staged File; null means use company.logoUrl

  // Loading / error state for initial profile fetch
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Build initial company state from JWT claims as a best-effort fallback
  const buildCompanyFromJwt = () => ({
    ...EMPTY_COMPANY,
    name:
      authUser?.companyName ||
      (activeCompany?.nameEn || activeCompany?.name || ""),
    ownerName:
      canEdit
        ? authUser?.nameEn || authUser?.name || defaultUser?.nameEn || defaultUser?.name || ""
        : "",
  })

  const [company, setCompany] = useState(buildCompanyFromJwt)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: company })

  // Load real company profile from backend; fall back to JWT data on error
  useEffect(() => {
    setIsLoading(true)
    setFetchError(null)

    getCompanyProfile()
      .then((data) => {
        if (data) {
          setCompany((prev) => ({ ...prev, ...data }))
          reset({ ...company, ...data })
        }
      })
      .catch((err) => {
        // Surface the error so the user knows data may be incomplete,
        // but keep the JWT-derived fallback visible rather than showing nothing
        setFetchError(err?.message || t("common.error"))
      })
      .finally(() => {
        setIsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fallback = t("profile.notProvided")
  const displayValue = (value) => value || fallback

  const startEditing = () => {
    reset(company)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    reset(company)
    setIsEditing(false)
  }

  const saveCompany = async (values) => {
    try {
      // Build the update payload, including the staged logo file if any
      const updatePayload = {
        ...values,
        logo: logo instanceof File ? logo : null,
      }

      const updated = await updateCompanyProfile(updatePayload)
      const safeUpdates = updated ?? values

      setCompany((current) => ({
        ...current,
        ...safeUpdates,
        logoUrl: logo ? URL.createObjectURL(logo) : current.logoUrl,
      }))
      setLogo(null) // clear staged logo after successful save
      setIsEditing(false)
      toast({
        type: "success",
        message: t("profile.company.saveSuccess"),
        description: t("profile.company.saveSuccessDescription"),
      })
    } catch (err) {
      toast({
        type: "error",
        message: t("profile.company.saveError", { defaultValue: "Failed to save. Please try again." }),
        description: err?.message,
      })
    }
  }

  const emailValue = company.email ? (
    <a className="hover:underline" href={`mailto:${company.email}`}>
      {company.email}
    </a>
  ) : fallback

  const websiteValue = company.website ? (
    <a
      className="text-(--brand-primary) hover:underline"
      href={company.website}
      target="_blank"
      rel="noreferrer"
    >
      {company.website}
    </a>
  ) : fallback

  return (
    <PageShell
      eyebrow={t("profile.company.eyebrow")}
      title={t("profile.company.title")}
      description={t("profile.company.description")}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label={t("common.loading")}>
          <div className="rounded-md border border-(--border-default) bg-(--bg-card) p-6 shadow-(--shadow-1)">
            <div className="flex gap-5">
              <div className="h-28 w-28 rounded-xl animate-skeleton shrink-0" />
              <div className="flex-1 flex flex-col gap-3 pt-2">
                <div className="h-6 w-48 rounded animate-skeleton" />
                <div className="h-4 w-32 rounded animate-skeleton" />
                <div className="h-3 w-64 rounded animate-skeleton" />
              </div>
            </div>
          </div>
          <div className="h-48 rounded-md animate-skeleton" />
          <div className="h-48 rounded-md animate-skeleton" />
        </div>
      )}

      {/* Fetch error banner — shown alongside JWT-derived fallback data */}
      {!isLoading && fetchError && (
        <div
          role="alert"
          className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg) mb-4"
        >
          {fetchError}
        </div>
      )}

      {/* Main form — shown after loading completes */}
      {!isLoading && (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(saveCompany)} noValidate>
          <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-6 text-start shadow-(--shadow-1)">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="w-full sm:w-52 shrink-0">
                <LogoUploader
                  currentLogo={company.logoUrl ?? null}
                  value={logo}
                  onChange={setLogo}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-2xl font-semibold text-(--text-primary)">
                    {displayValue(company.name)}
                  </h3>
                  <Badge variant="success" shape="pill">
                    {t(`profile.values.${company.accountStatus}`, {
                      defaultValue: displayValue(company.accountStatus),
                    })}
                  </Badge>
                  <Badge variant="info" shape="pill">
                    {canEdit
                      ? t(isEditing ? "profile.editingBadge" : "profile.editableBadge")
                      : t("profile.readOnlyBadge")}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  {displayValue(company.legalName)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-(--text-muted)">
                  {canEdit ? t("profile.company.ownerHelper") : t("profile.company.readOnlyHelper")}
                </p>
              </div>

              {canEdit && (
                <div className="flex shrink-0 flex-wrap gap-2 sm:self-start">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="secondary" onClick={cancelEditing}>
                        <X className="h-4 w-4" aria-hidden="true" />
                        {t("profile.actions.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText={t("profile.actions.saving")}
                      >
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {t("profile.actions.save")}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={startEditing}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      {t("profile.actions.edit")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
            <div className="flex min-w-0 flex-col gap-6">
              <ProfileSection
                icon={Landmark}
                title={t("profile.sections.companyIdentity")}
                description={t("profile.sections.companyIdentityDescription")}
              >
                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t("profile.fields.companyName")}
                      required
                      errorText={errors.name?.message}
                      {...register("name", {
                        required: t("profile.validation.companyNameRequired"),
                      })}
                    />
                    <Input
                      label={t("profile.fields.legalName")}
                      required
                      errorText={errors.legalName?.message}
                      {...register("legalName", {
                        required: t("profile.validation.legalNameRequired"),
                      })}
                    />
                    <Input label={t("profile.fields.taxId")} {...register("taxId")} />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem label={t("profile.fields.companyName")} value={displayValue(company.name)} />
                    <DetailItem label={t("profile.fields.legalName")} value={displayValue(company.legalName)} />
                    <DetailItem label={t("profile.fields.taxId")} value={displayValue(company.taxId)} />
                  </DetailGrid>
                )}
              </ProfileSection>

              <ProfileSection
                icon={Mail}
                title={t("profile.sections.contact")}
                description={t("profile.sections.contactDescription")}
              >
                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      type="email"
                      label={t("profile.fields.companyEmail")}
                      errorText={errors.email?.message}
                      {...register("email", {
                        pattern: {
                          value: EMAIL_PATTERN,
                          message: t("profile.validation.invalidEmail"),
                        },
                      })}
                    />
                    <Input label={t("profile.fields.companyPhone")} {...register("phone")} />
                    <Input
                      className="font-mono"
                      label={t("profile.fields.website")}
                      errorText={errors.website?.message}
                      {...register("website", {
                        validate: (value) =>
                          isValidWebsite(value) || t("profile.validation.invalidWebsite"),
                      })}
                    />
                    <Input label={t("profile.fields.headquarters")} {...register("headquarters")} />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem label={t("profile.fields.companyEmail")} value={emailValue} />
                    <DetailItem label={t("profile.fields.companyPhone")} value={displayValue(company.phone)} />
                    <DetailItem label={t("profile.fields.website")} value={websiteValue} />
                    <DetailItem label={t("profile.fields.headquarters")} value={displayValue(company.headquarters)} />
                  </DetailGrid>
                )}
              </ProfileSection>

              <ProfileSection
                icon={Briefcase}
                title={t("profile.sections.operations")}
                description={t("profile.sections.operationsDescription")}
              >
                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label={t("profile.fields.industry")} {...register("industry")} />
                    <Input label={t("profile.fields.companySize")} {...register("size")} />
                    <DetailGrid className="sm:col-span-2">
                      <DetailItem
                        label={t("profile.fields.createdAt")}
                        value={formatProfileDate(company.createdAt, language, fallback)}
                      />
                      <DetailItem label={t("profile.fields.ownerName")} value={displayValue(company.ownerName)} />
                    </DetailGrid>
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem label={t("profile.fields.industry")} value={displayValue(company.industry)} />
                    <DetailItem label={t("profile.fields.companySize")} value={displayValue(company.size)} />
                    <DetailItem
                      label={t("profile.fields.createdAt")}
                      value={formatProfileDate(company.createdAt, language, fallback)}
                    />
                    <DetailItem label={t("profile.fields.ownerName")} value={displayValue(company.ownerName)} />
                  </DetailGrid>
                )}
              </ProfileSection>
            </div>

            <aside className="flex min-w-0 flex-col gap-6">
              <ProfileSection icon={BookOpen} title={t("profile.sections.policy")}>
                <DetailGrid className="sm:grid-cols-1">
                  <DetailItem
                    label={t("profile.fields.policyStatus")}
                    value={
                      company.policyStatus ? (
                        <Badge variant="success">
                          {t(`profile.values.${company.policyStatus}`, {
                            defaultValue: displayValue(company.policyStatus),
                          })}
                        </Badge>
                      ) : (
                        fallback
                      )
                    }
                  />
                  <DetailItem
                    label={t("profile.fields.lastUpdated")}
                    value={formatProfileDate(company.policyUpdatedAt, language, fallback)}
                  />
                </DetailGrid>
              </ProfileSection>

              <ProfileSection icon={ShieldCheck} title={t("profile.sections.account")}>
                <DetailGrid className="sm:grid-cols-1">
                  <DetailItem
                    label={t("profile.fields.accountStatus")}
                    value={t(`profile.values.${company.accountStatus}`, {
                      defaultValue: displayValue(company.accountStatus),
                    })}
                  />
                  <DetailItem
                    label={t("profile.fields.accessLevel")}
                    value={canEdit ? t("profile.values.ownerAccess") : t("profile.values.hrReadOnlyAccess")}
                  />
                </DetailGrid>
              </ProfileSection>
            </aside>
          </div>
        </form>
      )}
    </PageShell>
  )
}
