import React, { useEffect, useState } from "react";
import {
  Briefcase,
  FileText,
  Landmark,
  Mail,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { LogoUploader } from "../features/company/components/LogoUploader";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/toast";
import { useApp } from "../context/app-context";
import {
  getCompanyProfile,
  updateCompanyProfile,
} from "../features/company/services/profile-service";
import { uploadCompanyPolicy } from "../features/company/services/company-policy-service";
import { FileUpload } from "../components/forms/file-upload";
import { useAuth } from "../features/auth/hooks/use-auth";
import {
  DetailGrid,
  DetailItem,
  ProfileSection,
} from "../features/profile/components/profile-details";
import { EmptyState } from "../components/layout/empty-state";
import { PageShell } from "./page-shell";
import { getImageUrl } from "../utils/get-image-url";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isOwnerRole(role) {
  return ["owner", "company_owner"].includes(role?.toLowerCase());
}

const EMPTY_COMPANY = {
  id: null,
  name: "",
  industry: "",
  headquarters: "",
  email: "",
  phone: "",
  workingHours: "",
  logoUrl: null,
};

export function CompanyProfilePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentUser: authUser } = useAuth();
  const { currentUser: defaultUser } = useApp();
  const currentUser = authUser || defaultUser;
  const canEdit = isOwnerRole(currentUser?.role);
  const [isEditing, setIsEditing] = useState(false);
  const [logo, setLogo] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const [company, setCompany] = useState(EMPTY_COMPANY);
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyFile, setPolicyFile] = useState(null);
  const [policyUploadError, setPolicyUploadError] = useState("");
  const [isUploadingPolicy, setIsUploadingPolicy] = useState(false);
  const [policyUploadSuccess, setPolicyUploadSuccess] = useState("");
  const [policyUploadKey, setPolicyUploadKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY_COMPANY });
  // Loads exactly once per mount. On 403, no company data is set;
  // isForbidden gates the entire form.
  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setFetchError(null);
    setIsForbidden(false);

    getCompanyProfile()
      .then((data) => {
        if (ignore) return;
        if (data) {
          setCompany(data);
          reset(data);
        }
      })
      .catch((err) => {
        if (ignore) return;
        if (err?.status === 403) {
          setIsForbidden(true);
        } else {
          setFetchError(err?.message || t("common.error"));
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fallback = t("profile.notProvided");
  const displayValue = (value) => value || fallback;

  const startEditing = () => {
    reset(company);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset(company);
    setIsEditing(false);
  };

  const saveCompany = async (values) => {
    try {
      const updatePayload = {
        headquarters: values.headquarters ?? company.headquarters ?? "",
        phone: values.phone ?? company.phone ?? "",
        email: values.email ?? company.email ?? "",
        industry: values.industry ?? company.industry ?? "",
        workingHours: values.workingHours ?? company.workingHours ?? "",
        logo: logo instanceof File ? logo : null,
      };

      const updated = await updateCompanyProfile(updatePayload);
      const safeUpdates = updated ?? { ...company, ...updatePayload };

      setCompany((current) => ({
        ...current,
        ...safeUpdates,
        logoUrl: logo
          ? URL.createObjectURL(logo)
          : (safeUpdates.logoUrl ?? current.logoUrl),
      }));

      setLogo(null);
      setIsEditing(false);

      toast({
        type: "success",
        message: t("profile.company.saveSuccess"),
        description: t("profile.company.saveSuccessDescription"),
      });
    } catch (err) {
      toast({
        type: "error",
        message: t("profile.company.saveError", {
          defaultValue: "Failed to save. Please try again.",
        }),
        description: err?.message,
      });
    }
  };

  const emailValue = company.email ? (
    <a className="hover:underline" href={`mailto:${company.email}`}>
      {company.email}
    </a>
  ) : (
    fallback
  );

  const handlePolicyUpload = async () => {
    if (!canEdit) return;
    if (!policyFile) {
      setPolicyUploadError(
        t("profile.policy.uploadRequired", {
          defaultValue: "Select a PDF file to upload.",
        }),
      );
      setPolicyUploadSuccess("");
      return;
    }

    const trimmedTitle = policyTitle.trim();
    if (!trimmedTitle) {
      setPolicyUploadError(
        t("profile.policy.titleRequired", {
          defaultValue: "Policy title is required.",
        }),
      );
      setPolicyUploadSuccess("");
      return;
    }

    try {
      setIsUploadingPolicy(true);
      setPolicyUploadError("");
      setPolicyUploadSuccess("");

      await uploadCompanyPolicy({
        title: trimmedTitle,
        pdf: policyFile,
      });

      setPolicyTitle("");
      setPolicyFile(null);
      setPolicyUploadKey((value) => value + 1);
      setPolicyUploadSuccess(
        t("profile.policy.uploadSuccess", {
          defaultValue: "Company policy uploaded successfully.",
        }),
      );
    } catch (err) {
      setPolicyUploadError(
        err?.message ||
          t("profile.policy.uploadError", {
            defaultValue: "Unable to upload the policy PDF.",
          }),
      );
    } finally {
      setIsUploadingPolicy(false);
    }
  };

  return (
    <PageShell
      eyebrow={t("profile.company.eyebrow")}
      title={t("profile.company.title")}
      description={t("profile.company.description")}>
      {isLoading && (
        <div
          className="flex flex-col gap-6"
          aria-busy="true"
          aria-label={t("common.loading")}>
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

      {!isLoading && isForbidden && (
        <section className="rounded-md border border-(--border-default) bg-(--bg-card) shadow-(--shadow-1)">
          <EmptyState
            illustrationType="offline"
            title={t("profile.company.forbiddenTitle", {
              defaultValue: "You don't have access to this page",
            })}
            description={t("profile.company.forbiddenDesc", {
              defaultValue:
                "Company profile details are only visible to the company owner.",
            })}
          />
        </section>
      )}

      {!isLoading && !isForbidden && fetchError && (
        <div
          role="alert"
          className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg) mb-4">
          {fetchError}
        </div>
      )}

      {!isLoading && !isForbidden && !fetchError && (
        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(saveCompany)}
          noValidate>
          <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-6 text-start shadow-(--shadow-1)">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="w-max max-w-full shrink-0">
                <LogoUploader
                  currentLogo={getImageUrl(company.logoUrl)}
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
                      ? t(
                          isEditing
                            ? "profile.editingBadge"
                            : "profile.editableBadge",
                        )
                      : t("profile.readOnlyBadge")}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-(--text-muted)">
                  {canEdit
                    ? t("profile.company.ownerHelper")
                    : t("profile.company.readOnlyHelper")}
                </p>
              </div>

              {canEdit && (
                <div className="flex shrink-0 flex-wrap gap-2 sm:self-start">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={cancelEditing}>
                        <X className="h-4 w-4" aria-hidden="true" />
                        {t("profile.actions.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText={t("profile.actions.saving")}>
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
                description={t("profile.sections.companyIdentityDescription")}>
                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t("profile.fields.companyName")}
                      value={displayValue(company.name)}
                      disabled
                    />
                    <Input
                      label={t("profile.fields.industry")}
                      {...register("industry")}
                    />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem
                      label={t("profile.fields.companyName")}
                      value={displayValue(company.name)}
                    />
                    <DetailItem
                      label={t("profile.fields.industry")}
                      value={displayValue(company.industry)}
                    />
                  </DetailGrid>
                )}
              </ProfileSection>

              <ProfileSection
                icon={Mail}
                title={t("profile.sections.contact")}
                description={t("profile.sections.contactDescription")}>
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
                    <Input
                      label={t("profile.fields.companyPhone")}
                      {...register("phone")}
                    />
                    <Input
                      label={t("profile.fields.headquarters")}
                      {...register("headquarters")}
                    />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem
                      label={t("profile.fields.companyEmail")}
                      value={emailValue}
                    />
                    <DetailItem
                      label={t("profile.fields.companyPhone")}
                      value={displayValue(company.phone)}
                    />
                    <DetailItem
                      label={t("profile.fields.headquarters")}
                      value={displayValue(company.headquarters)}
                    />
                  </DetailGrid>
                )}
              </ProfileSection>

              <ProfileSection
                icon={Briefcase}
                title={t("profile.sections.operations")}
                description={t("profile.sections.operationsDescription")}>
                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t("profile.fields.workingHours", {
                        defaultValue: "Working Hours",
                      })}
                      {...register("workingHours")}
                    />
                  </div>
                ) : (
                  <DetailGrid>
                    <DetailItem
                      label={t("profile.fields.workingHours", {
                        defaultValue: "Working Hours",
                      })}
                      value={displayValue(company.workingHours)}
                    />
                  </DetailGrid>
                )}
              </ProfileSection>

              {canEdit && (
                <ProfileSection
                  icon={FileText}
                  title={t("profile.sections.policy")}
                  description={t("profile.policy.description", {
                    defaultValue:
                      "Upload the latest company policy handbook for AI-powered legal context.",
                  })}>
                  <div className="grid gap-4">
                    <Input
                      label={t("profile.policy.titleLabel", {
                        defaultValue: "Policy title",
                      })}
                      value={policyTitle}
                      onChange={(event) => setPolicyTitle(event.target.value)}
                      placeholder={t("profile.policy.titlePlaceholder", {
                        defaultValue: "Employee Handbook",
                      })}
                    />

                    <FileUpload
                      key={policyUploadKey}
                      label={t("profile.policy.fileLabel", {
                        defaultValue: "Company policy PDF",
                      })}
                      maxSizeMB={20}
                      acceptedTypes=".pdf,application/pdf"
                      onFileDrop={(files) => setPolicyFile(files[0] ?? null)}
                    />

                    {policyUploadError && (
                      <div
                        role="alert"
                        className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
                        {policyUploadError}
                      </div>
                    )}

                    {policyUploadSuccess && (
                      <div
                        role="status"
                        className="rounded-md border border-(--status-success-fg) bg-(--status-success-bg) px-4 py-3 text-sm text-(--status-success-fg)">
                        {policyUploadSuccess}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="primary"
                      className="self-start"
                      onClick={handlePolicyUpload}
                      isLoading={isUploadingPolicy}
                      loadingText={t("profile.policy.uploading", {
                        defaultValue: "Uploading...",
                      })}>
                      {t("profile.policy.uploadButton", {
                        defaultValue: "Upload policy",
                      })}
                    </Button>
                  </div>
                </ProfileSection>
              )}
            </div>
          </div>
        </form>
      )}
    </PageShell>
  );
}
