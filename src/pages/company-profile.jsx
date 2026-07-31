import React, { useEffect, useState } from "react"
import { Briefcase, Landmark, Mail, Pencil, Save, X } from "lucide-react"
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
  ProfileSection,
} from "../features/profile/components/profile-details"
import { PageShell } from "./page-shell"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isOwnerRole(role) {
  return ["owner", "company_owner"].includes(role?.toLowerCase())
}

// Default empty company shape — populated from backend on load
const EMPTY_COMPANY = {
  id: null,
  name: "",
  industry: "",
  headquarters: "",
  email: "",
  phone: "",
  workingHours: "",
  logoUrl: null,
}

export function CompanyProfilePage() {
  const { t } = useTranslation()
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
                  disabled={!isEditing}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-2xl font-semibold text-(--text-primary)">
                    {displayValue(company.name)}
                  </h3>
                  <Badge variant="info" shape="pill">
                    {canEdit
                      ? t(isEditing ? "profile.editingBadge" : "profile.editableBadge")
                      : t("profile.readOnlyBadge")}
                  </Badge>
                </div>
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

          <div className="grid gap-6">
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
                    <Input label={t("profile.fields.industry")} {...register("industry")} />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem label={t("profile.fields.companyName")} value={displayValue(company.name)} />
                    <DetailItem label={t("profile.fields.industry")} value={displayValue(company.industry)} />
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
                    <Input label={t("profile.fields.headquarters")} {...register("headquarters")} />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem label={t("profile.fields.companyEmail")} value={emailValue} />
                    <DetailItem label={t("profile.fields.companyPhone")} value={displayValue(company.phone)} />
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
                    <Input label={t("profile.fields.workingHours", { defaultValue: "Working Hours" })} {...register("workingHours")} />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem label={t("profile.fields.workingHours", { defaultValue: "Working Hours" })} value={displayValue(company.workingHours)} />
                  </DetailGrid>
                )}
              </ProfileSection>
            </div>
          </div>
        </form>
      )}
    </PageShell>
  )
}
