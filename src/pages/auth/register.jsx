import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { AuthLayout } from "../../components/auth/auth-layout"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAuth } from "../../features/auth/hooks/use-auth"
import { registerCompany, normalizeAuthResponse } from "../../features/auth/services/auth-service"
import { useTranslation } from "react-i18next"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async ({ company_name, tax_id, owner_full_name, owner_email, password }) => {
    setSubmitError("")

    try {
      const raw = await registerCompany({ company_name, tax_id, owner_full_name, owner_email, password })
      const normalized = normalizeAuthResponse(raw)
      setToken(normalized.token, normalized.refreshToken)
      navigate("/owner/dashboard", { replace: true })
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("auth.registerFailed")
      setSubmitError(message)
    }
  }

  return (
    <AuthLayout
      title={t("auth.createOwner")}
      description={t("auth.createOwnerDesc")}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <div role="alert" className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
            {submitError}
          </div>
        )}

        <Input
          label={t("auth.ownerFullName")}
          autoComplete="name"
          required
          errorText={errors.owner_full_name?.message}
          {...register("owner_full_name", { required: t("validation.required") })}
        />
        <Input
          label={t("auth.companyName")}
          autoComplete="organization"
          required
          errorText={errors.company_name?.message}
          {...register("company_name", { required: t("validation.required") })}
        />
        <Input
          label={t("auth.taxId")}
          autoComplete="off"
          required
          hintText={t("auth.taxIdHint")}
          errorText={errors.tax_id?.message}
          {...register("tax_id", { required: t("validation.required") })}
        />
        <Input
          type="email"
          label={t("auth.email")}
          autoComplete="email"
          required
          errorText={errors.owner_email?.message}
          {...register("owner_email", {
            required: t("validation.required"),
            pattern: { value: EMAIL_PATTERN, message: t("validation.invalidEmail") },
          })}
        />
        <Input
          type="password"
          label={t("auth.password")}
          autoComplete="new-password"
          required
          hintText={t("auth.passwordHint")}
          errorText={errors.password?.message}
          {...register("password", {
            required: t("validation.required"),
            minLength: { value: 8, message: t("validation.passwordLength") },
          })}
        />
        <Input
          type="password"
          label={t("auth.confirmPassword")}
          autoComplete="new-password"
          required
          errorText={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: t("validation.required"),
            validate: (value, values) => value === values.password || t("validation.passwordMismatch"),
          })}
        />
        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" isLoading={isSubmitting} loadingText={t("auth.creatingAccount")}>
          {t("auth.createAccount")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--text-secondary)">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link className="font-semibold text-(--brand-primary) underline-offset-4 hover:underline" to="/login">
          {t("auth.logIn")}
        </Link>
      </p>
    </AuthLayout>
  )
}
