import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../../components/auth/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { forgotPassword } from "../../features/auth/services/auth-service";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async ({ email }) => {
    setSubmitError("");
    setSuccessMessage("");

    try {
      const response = await forgotPassword({ email });
      const message =
        response?.message ||
        t("auth.forgotPasswordSuccess", {
          defaultValue:
            "If an account exists for this email, a verification code has been sent.",
        });
      setSuccessMessage(message);
      navigate("/reset-password", {
        replace: true,
        state: { email },
      });
    } catch (error) {
      setSubmitError(
        error?.message ||
          t("auth.forgotPasswordError", {
            defaultValue: "Unable to send the verification code.",
          }),
      );
    }
  };

  return (
    <AuthLayout
      title={t("auth.forgotPasswordTitle", { defaultValue: "Forgot password" })}
      description={t("auth.forgotPasswordDescription", {
        defaultValue: "Enter your email to receive a verification code.",
      })}>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate>
        {successMessage && (
          <div
            role="status"
            className="rounded-md border border-(--status-success-fg) bg-(--status-success-bg) px-4 py-3 text-sm text-(--status-success-fg)">
            {successMessage}
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
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
            pattern: {
              value: EMAIL_PATTERN,
              message: t("validation.invalidEmail"),
            },
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          isLoading={isSubmitting}
          loadingText={t("auth.sendingCode", { defaultValue: "Sending..." })}>
          {t("auth.sendCode", { defaultValue: "Send code" })}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--text-secondary)">
        <Link
          className="font-semibold text-(--brand-primary) underline-offset-4 hover:underline"
          to="/login">
          {t("auth.backToLogin", { defaultValue: "Back to login" })}
        </Link>
      </p>
    </AuthLayout>
  );
}
