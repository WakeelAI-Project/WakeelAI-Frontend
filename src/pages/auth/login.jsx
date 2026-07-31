import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useLocation } from "react-router"
import { AuthLayout } from "../../components/auth/auth-layout"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { SegmentedControl } from "../../components/ui/segmented-control"
import { useAuth } from "../../features/auth/hooks/use-auth"
import { login as loginRequest, normalizeAuthResponse } from "../../features/auth/services/auth-service"
import { decodeToken } from "../../features/auth/utils/jwt"
import { useLocale } from "../../hooks/use-locale"
import { useTranslation } from "react-i18next"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const { setToken } = useAuth()
  const location = useLocation()
  const [selectedRole, setSelectedRole] = useState("Owner")
  const [submitError, setSubmitError] = useState("")
  const { isRtl } = useLocale()
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: location.state?.email || "", password: "" } })

  const onSubmit = async ({ email, password }) => {
    setSubmitError("")

    try {
      const raw = await loginRequest(email, password)
      // normalizeAuthResponse handles both { token } and { access_token } backend shapes
      const normalized = normalizeAuthResponse(raw)

      if (!normalized.token) {
        setSubmitError(t("auth.loginFailed"))
        return
      }

      const decoded = decodeToken(normalized.token)
      const role = (decoded?.role || "").toLowerCase()
      const matchesRole =
        selectedRole === "Owner" ? role.includes("owner") : role.includes("hr")

      if (!matchesRole) {
        resetField("password")
        setSubmitError(t("auth.roleMismatch"))
        return
      }

      setToken(normalized.token, normalized.refreshToken)
    } catch (error) {
      setSubmitError(error?.message || t("auth.loginFailed"))
    }
  }

  return (
    <AuthLayout
      title={t("auth.welcomeBack")}
      description={t("auth.welcomeDesc")}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-1.5 text-start">
          <span className="text-sm font-medium text-(--text-primary)">
            {t("auth.signInAs")}
          </span>
          <SegmentedControl
            name="login-role"
            className="w-full"
            value={selectedRole}
            onChange={setSelectedRole}
            options={[
              { value: "Owner", label: t("auth.companyOwner") },
              { value: "HR", label: t("auth.hrUser") },
            ]}
          />
        </div>

        {submitError && (
          <div role="alert" className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
            {submitError}
          </div>
        )}

        <Input
          type="email"
          label={t("auth.email")}
          autoComplete="email"
          required
          errorText={errors.email?.message}
          {...register("email", {
            required: t("validation.required"),
            pattern: { value: EMAIL_PATTERN, message: t("validation.invalidEmail") },
          })}
        />
        <Input
          type="password"
          label={t("auth.password")}
          autoComplete="current-password"
          required
          errorText={errors.password?.message}
          {...register("password", { required: t("validation.required") })}
        />
        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" isLoading={isSubmitting} loadingText={t("auth.signingIn")}>
          {t("auth.signIn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--text-secondary)">
        {t("auth.newOwner")}{" "}
        <Link className="font-semibold text-(--brand-primary) underline-offset-4 hover:underline" to="/register">
          {t("auth.createAccount")}
        </Link>
      </p>
    </AuthLayout>
  )
}
