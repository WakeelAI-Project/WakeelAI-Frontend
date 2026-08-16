import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { OTPInput } from "../../components/ui/otp-input";
import { AuthLayout } from "../../components/auth/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { resetPassword } from "../../features/auth/services/auth-service";

const PASSWORD_MIN_LENGTH = 8;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otp, setOtp] = useState("");
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const newPassword = watch("new_password");

  const onSubmit = async ({ new_password }) => {
    setSubmitError("");
    setSuccessMessage("");

    if (otp.length !== 6) {
      setSubmitError(t("auth.invalidOtp", { defaultValue: "Enter the 6-digit verification code." }));
      return;
    }

    try {
      await resetPassword({
        email,
        otp,
        new_password,
      });

      setSuccessMessage(
        t("auth.resetPasswordSuccess", {
          defaultValue: "Your password has been reset successfully.",
        }),
      );

      navigate("/login", {
        replace: true,
        state: { message: t("auth.resetPasswordLoginPrompt", {
          defaultValue: "Password reset successful. Please sign in with your new password.",
        }) },
      });
    } catch (error) {
      setSubmitError(error?.message || t("auth.resetPasswordError", {
        defaultValue: "Unable to reset the password. Please try again.",
      }));
    }
  };

  return (
    <AuthLayout
      title={t("auth.resetPasswordTitle", { defaultValue: "Reset password" })}
      description={t("auth.resetPasswordDescription", {
        defaultValue: "Enter the code sent to your email and create a new password.",
      })}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {successMessage && (
          <div role="status" className="rounded-md border border-(--status-success-fg) bg-(--status-success-bg) px-4 py-3 text-sm text-(--status-success-fg)">
            {successMessage}
          </div>
        )}

        {submitError && (
          <div role="alert" className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
            {submitError}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-(--text-primary)">{t("auth.verificationCode", { defaultValue: "Verification code" })}</label>
          <OTPInput value={otp} onChange={setOtp} error={Boolean(submitError)} />
        </div>

        <Input
          type="password"
          label={t("auth.newPassword", { defaultValue: "New password" })}
          autoComplete="new-password"
          required
          hintText={t("auth.passwordHint", { defaultValue: `Minimum ${PASSWORD_MIN_LENGTH} characters` })}
          errorText={errors.new_password?.message}
          {...register("new_password", {
            required: t("validation.required"),
            minLength: {
              value: PASSWORD_MIN_LENGTH,
              message: t("auth.passwordMinLength", {
                defaultValue: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
              }),
            },
          })}
        />

        <Input
          type="password"
          label={t("auth.confirmPassword", { defaultValue: "Confirm password" })}
          autoComplete="new-password"
          required
          errorText={errors.confirm_password?.message}
          {...register("confirm_password", {
            required: t("validation.required"),
            validate: (value) =>
              value === newPassword ||
              t("auth.passwordMismatch", { defaultValue: "Passwords do not match" }),
          })}
        />

        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" isLoading={isSubmitting} loadingText={t("auth.resettingPassword", { defaultValue: "Resetting..." })}>
          {t("auth.resetPasswordButton", { defaultValue: "Reset password" })}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--text-secondary)">
        <Link className="font-semibold text-(--brand-primary) underline-offset-4 hover:underline" to="/login">
          {t("auth.backToLogin", { defaultValue: "Back to login" })}
        </Link>
      </p>
    </AuthLayout>
  );
}
