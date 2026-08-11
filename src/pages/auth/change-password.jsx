import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
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
  const { isAuthenticated, logout, temporaryPassword, mustChangePassword, clearTemporaryPassword } = useAuth()
  const [submitError, setSubmitError] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { new_password: "", confirm_password: "" },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const newPassword = watch("new_password")

  // If user somehow navigates here without being authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async ({ new_password }) => {
    setSubmitError("")

    try {
      // For first-login password change, use the temporary password stored during login
      // For normal password change, temporaryPassword will be null and the UI should
      // have a field for current password (not implemented yet as this is first-login flow)
      const currentPassword = mustChangePassword && temporaryPassword ? temporaryPassword : ""
      
      if (!currentPassword && mustChangePassword) {
        setSubmitError(t("auth.missingCurrentPassword", { 
          defaultValue: "Unable to change password. Please log in again." 
        }))
        // Clear auth and redirect to login
        await logout()
        navigate("/login", { replace: true })
        return
      }

      await changePassword({
        current_password: currentPassword,
        new_password: new_password,
      })

      // Clear the temporary password after successful change
      clearTemporaryPassword()

      // After successful password change, logout and redirect to login
      // This clears the mustChangePassword flag and forces re-authentication
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

        {submitError && (
          <div role="alert" className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
            {submitError}
          </div>
        )}

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
