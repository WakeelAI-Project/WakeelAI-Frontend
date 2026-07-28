
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useLocation } from "react-router"
import { AuthLayout } from "../../components/auth/auth-layout"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { SegmentedControl } from "../../components/ui/segmented-control"
import { useTheme } from "../../components/providers/theme-provider"
import { useAuth } from "../../features/auth/hooks/use-auth"
import { login as loginRequest } from "../../features/auth/services/auth-service"
import { decodeToken } from "../../features/auth/utils/jwt"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const { direction } = useTheme()
  const { setToken } = useAuth()
  const location = useLocation()
  const [selectedRole, setSelectedRole] = useState("Owner")
  const [submitError, setSubmitError] = useState("")
  const isRtl = direction === "rtl"
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: location.state?.email || "", password: "" } })

  const onSubmit = async ({ email, password }) => {
    setSubmitError("")

    try {
      const data = await loginRequest(email, password)
      const decoded = decodeToken(data?.access_token)
      const role = (decoded?.role || "").toLowerCase()
      const matchesRole = selectedRole === "Owner" ? (role.includes("owner")) : role.includes("hr")

      if (!matchesRole) {
        resetField("password")
        setSubmitError(
          isRtl
            ? "هذا الحساب لا يطابق نوع المستخدم المحدد. تحقق من الاختيار وحاول مرة أخرى."
            : "This account does not match the selected user type. Check the selection and try again."
        )
        return
      }

      setToken(data.access_token, data.refresh_token)
    } catch (error) {
      setSubmitError(error?.message || (isRtl ? "تعذر تسجيل الدخول. حاول مرة أخرى." : "Unable to log in. Please try again."))
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      titleAr="مرحباً بعودتك"
      description="Sign in as the company owner or an invited HR user."
      descriptionAr="سجّل الدخول بصفتك مالك الشركة أو مسؤول موارد بشرية تمت دعوته."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-1.5 text-start">
          <span className="text-sm font-medium text-(--text-primary)">
            {isRtl ? "تسجيل الدخول بصفة" : "Sign in as"}
          </span>
          <SegmentedControl
            name="login-role"
            className="w-full"
            value={selectedRole}
            onChange={setSelectedRole}
            options={[
              { value: "Owner", label: isRtl ? "مالك الشركة" : "Company Owner" },
              { value: "HR", label: isRtl ? "الموارد البشرية" : "HR User" },
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
          label={isRtl ? "البريد الإلكتروني" : "Email"}
          autoComplete="email"
          required
          errorText={errors.email?.message}
          {...register("email", {
            required: isRtl ? "البريد الإلكتروني مطلوب" : "Email is required",
            pattern: { value: EMAIL_PATTERN, message: isRtl ? "أدخل بريداً إلكترونياً صالحاً" : "Enter a valid email address" },
          })}
        />
        <Input
          type="password"
          label={isRtl ? "كلمة المرور" : "Password"}
          autoComplete="current-password"
          required
          errorText={errors.password?.message}
          {...register("password", { required: isRtl ? "كلمة المرور مطلوبة" : "Password is required" })}
        />
        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" isLoading={isSubmitting} loadingText={isRtl ? "جارٍ تسجيل الدخول..." : "Signing in..."}>
          {isRtl ? "تسجيل الدخول" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--text-secondary)">
        {isRtl ? "مالك شركة جديد؟ " : "New company owner? "}
        <Link className="font-semibold text-(--brand-primary) underline-offset-4 hover:underline" to="/register">
          {isRtl ? "أنشئ حساباً" : "Create an account"}
        </Link>
      </p>
    </AuthLayout>
  )
}

