import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useOutletContext } from "react-router";
import { AuthLayout } from "../../components/auth/auth-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SegmentedControl } from "../../components/ui/segmented-control";
import { useAuth } from "../../features/auth/hooks/use-auth";
import { decodeToken } from "../../features/auth/utils/jwt";
import {
  dashboardPathForRole,
  resolveWebRole,
} from "../../features/auth/utils/roles";
import { useLocale } from "../../hooks/use-locale";
import { useTranslation } from "react-i18next";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const { loginWithoutCommit, commitSession, clearAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const [selectedRole, setSelectedRole] = useState("Owner");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || "",
  );
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");
  const { isRtl } = useLocale();
  const { t } = useTranslation();

  // Check for session_expired query param
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("session_expired") === "1") {
      setSessionExpiredMessage(
        t("auth.sessionExpired", { defaultValue: "Your session expired. Please log in again." })
      );
      // Clean up the URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate, t]);

  // GuestRoute clears any session whose role has no web console (Employee) and
  // hands the reason down through the outlet context.
  const authNotice = outletContext?.authNotice;
  React.useEffect(() => {
    if (authNotice) setSubmitError(t(authNotice));
  }, [authNotice, t]);
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: location.state?.email || "", password: "" },
  });

  const onSubmit = async ({ email, password }) => {
    setSubmitError("");
    setSuccessMessage("");
    setSessionExpiredMessage("");

    try {
      // Fetch the token WITHOUT committing a session — the role claim has to be
      // inspected first, otherwise GuestRoute navigates away the instant
      // isAuthenticated flips and the checks below become unreachable.
      const normalized = await loginWithoutCommit(email, password);

      if (!normalized.token) {
        setSubmitError(t("auth.loginFailed"));
        return;
      }

      const decoded = decodeToken(normalized.token);
      const webRole = resolveWebRole(decoded?.role);

      // Employees are mobile-only — no web session is created for them.
      if (!webRole) {
        clearAuth();
        resetField("password");
        setSubmitError(t("auth.employeeMobileOnly"));
        return;
      }

      const matchesRole =
        selectedRole === "Owner" ? webRole === "owner" : webRole === "hr";

      if (!matchesRole) {
        clearAuth();
        resetField("password");
        setSubmitError(t("auth.roleMismatch"));
        return;
      }

      // Role verified — only now does a session exist.
      commitSession(normalized);

      // Check must_change_password and redirect if needed
      if (normalized.mustChangePassword) {
        // Redirect to change password page with password in navigation state
        navigate("/change-password", {
          replace: true,
          state: { currentPassword: password }
        });
        return;
      }

      navigate(dashboardPathForRole(decoded?.role), { replace: true });
    } catch (error) {
      setSubmitError(error?.message || t("auth.loginFailed"));
    }
  };

  return (
    <AuthLayout
      title={t("auth.welcomeBack")}
      description={t("auth.welcomeDesc")}>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate>
        <div className="flex flex-col gap-1.5 text-start">
          <span className="text-sm font-medium text-(--text-primary)">
            {t("auth.signInAs")}
          </span>
          <SegmentedControl
            name="login-role"
            fullWidth
            className="w-full"
            value={selectedRole}
            onChange={setSelectedRole}
            options={[
              { value: "Owner", label: t("auth.companyOwner") },
              { value: "HR", label: t("auth.hrUser") },
            ]}
          />
        </div>

        {successMessage && (
          <div
            role="status"
            className="rounded-md border border-(--status-success-fg) bg-(--status-success-bg) px-4 py-3 text-sm text-(--status-success-fg)">
            {successMessage}
          </div>
        )}

        {sessionExpiredMessage && (
          <div
            role="status"
            className="rounded-md border border-(--status-warning-fg) bg-(--status-warning-bg) px-4 py-3 text-sm text-(--status-warning-fg)">
            {sessionExpiredMessage}
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
        <Input
          type="password"
          label={t("auth.password")}
          autoComplete="current-password"
          required
          errorText={errors.password?.message}
          {...register("password", { required: t("validation.required") })}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          isLoading={isSubmitting}
          loadingText={t("auth.signingIn")}>
          {t("auth.signIn")}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm text-(--text-secondary)">
        <Link
          className="font-medium text-(--brand-primary) underline-offset-4 hover:underline"
          to="/forgot-password">
          {t("auth.forgotPassword")}
        </Link>
        <p>
          {t("auth.newOwner")}{" "}
          <Link
            className="font-semibold text-(--brand-primary) underline-offset-4 hover:underline"
            to="/register">
            {t("auth.createAccount")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
