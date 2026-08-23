import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router"
import { AuthLayout } from "../../components/auth/auth-layout"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { changePassword } from "../../features/profile/services/account-service"
import { useAuth } from "../../features/auth/hooks/use-auth"
import { useTranslation } from "react-i18next"

const PASSWORD_MIN_LENGTH = 8

export function ChangePasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout, clearMustChangePassword } = useAuth()
  const [submitError, setSubmitError] = useState("")

  // Get the current password from navigation state (passed from login page).
  // A hard refresh wipes router state, so this is empty on reload — in that case
  // the user is told plainly what to type and given a reset escape hatch, rather
  // than being asked for a password out of nowhere.
  const temporaryPassword = location.state?.currentPassword ?? ""
  const hasTemporaryPassword = Boolean(temporaryPassword)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { 
      current_password: temporaryPassword, // Pre-fill from navigation state if available
      new_password: "", 
      confirm_password: "" 
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const newPassword = watch("new_password")

  // If user somehow navigates here without being authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async ({ current_password, new_password }) => {
    setSubmitError("")

    try {
      // current_password is now either from the form input or pre-filled from navigation state
      if (!current_password) {
        setSubmitError(t("auth.missingCurrentPassword", { 
          defaultValue: "Current password is required." 
        }))
        return
      }

      await changePassword({
        current_password: current_password,
        new_password: new_password,
      })

      // Clear the mustChangePassword flag after successful change
      clearMustChangePassword()

      // After successful password change, logout and redirect to login
      // This clears auth state and forces re-authentication
      await logout()
      navigate("/login", { 
        replace: true,
        state: { message: t("auth.passwordChanged", { defaultValue: "Password changed successfully. Please log in with your new password." }) }
      })
    } catch (error) {
      setSubmitError(error?.message || t("auth.passwordChangeFailed", { defaultValue: "Failed to change password. Please try again." }))
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <AuthLayout
      title={t("auth.changePasswordTitle", { defaultValue: "Change Your Password" })}
      description={t("auth.changePasswordDesc", { defaultValue: "You must change your password before continuing." })}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="rounded-md border border-(--border-default) bg-(--bg-card-subtle) px-4 py-3 text-sm text-(--text-secondary)">
          {t("auth.firstLoginNotice", { defaultValue: "This is your first login. Please set a new password to secure your account." })}
        </div>

        {!hasTemporaryPassword && (
          <div
            role="status"
            className="flex flex-col gap-2 rounded-md border border-(--status-warning-fg) bg-(--status-warning-bg) px-4 py-3 text-sm text-(--status-warning-fg)">
            <span>{t("auth.currentPasswordUnknown")}</span>
            <Link
              className="font-semibold underline underline-offset-4"
              to="/forgot-password">
              {t("auth.forgotPassword")}
            </Link>
          </div>
        )}

        {submitError && (
          <div role="alert" className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
            {submitError}
          </div>
        )}

        <Input
          type="password"
          label={t("auth.currentPassword", { defaultValue: "Current Password" })}
          autoComplete="current-password"
          required
          errorText={errors.current_password?.message}
          {...register("current_password", {
            required: t("validation.required"),
          })}
        />

        <Input
          type="password"
          label={t("auth.newPassword", { defaultValue: "New Password" })}
          autoComplete="new-password"
          required
          hintText={t("auth.passwordHint", { defaultValue: `Minimum ${PASSWORD_MIN_LENGTH} characters` })}
          errorText={errors.new_password?.message}
          {...register("new_password", {
            required: t("validation.required"),
            minLength: {
              value: PASSWORD_MIN_LENGTH,
              message: t("auth.passwordMinLength", { defaultValue: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }),
            },
          })}
        />

        <Input
          type="password"
          label={t("auth.confirmNewPassword", { defaultValue: "Confirm New Password" })}
          autoComplete="new-password"
          required
          errorText={errors.confirm_password?.message}
          {...register("confirm_password", {
            required: t("validation.required"),
            validate: (value) =>
              value === newPassword || t("auth.passwordMismatch", { defaultValue: "Passwords do not match" }),
          })}
        />

        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          className="mt-2 w-full" 
          isLoading={isSubmitting} 
          loadingText={t("auth.changingPassword", { defaultValue: "Changing password..." })}
        >
          {t("auth.changePasswordButton", { defaultValue: "Change Password" })}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-(--text-muted)">
        {t("auth.changePasswordFooter", { defaultValue: "After changing your password, you will be redirected to log in again." })}
      </p>
    </AuthLayout>
  )
}
