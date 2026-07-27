import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { AuthLayout } from "../../components/auth/auth-layout"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useTheme } from "../../components/providers/theme-provider"
import { useToast } from "../../components/ui/toast"
import { register as registerAccount } from "../../features/auth/services/auth-service"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { direction } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const isRtl = direction === "rtl"
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const required = isRtl ? "هذا الحقل مطلوب" : "This field is required"

  const onSubmit = async ({ ownerName, companyName, email, password }) => {
    setSubmitError("")

    try {
      await registerAccount({ ownerName, companyName, email, password })
      toast({
        type: "success",
        message: isRtl ? "تم إنشاء الحساب" : "Account created",
        description: isRtl ? "يمكنك الآن تسجيل الدخول كمالك الشركة." : "You can now sign in as the company owner.",
      })
      navigate("/login", { replace: true, state: { email } })
    } catch (error) {
      setSubmitError(error?.message || (isRtl ? "تعذر إنشاء الحساب. حاول مرة أخرى." : "Unable to create the account. Please try again."))
    }
  }

  return (
    <AuthLayout
      title="Create owner account"
      titleAr="إنشاء حساب المالك"
      description="Only company owners can register directly. HR users must be invited by an owner."
      descriptionAr="يمكن لمالك الشركة فقط التسجيل مباشرة. يجب دعوة مستخدمي الموارد البشرية بواسطة المالك."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <div role="alert" className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)">
            {submitError}
          </div>
        )}

        <Input label={isRtl ? "اسم المالك" : "Owner name"} autoComplete="name" required errorText={errors.ownerName?.message} {...register("ownerName", { required })} />
        <Input label={isRtl ? "اسم الشركة" : "Company name"} autoComplete="organization" required errorText={errors.companyName?.message} {...register("companyName", { required })} />
        <Input
          type="email"
          label={isRtl ? "البريد الإلكتروني" : "Email"}
          autoComplete="email"
          required
          errorText={errors.email?.message}
          {...register("email", {
            required,
            pattern: { value: EMAIL_PATTERN, message: isRtl ? "أدخل بريداً إلكترونياً صالحاً" : "Enter a valid email address" },
          })}
        />
        <Input
          type="password"
          label={isRtl ? "كلمة المرور" : "Password"}
          autoComplete="new-password"
          required
          hintText={isRtl ? "8 أحرف على الأقل" : "At least 8 characters"}
          errorText={errors.password?.message}
          {...register("password", {
            required,
            minLength: { value: 8, message: isRtl ? "استخدم 8 أحرف على الأقل" : "Use at least 8 characters" },
          })}
        />
        <Input
          type="password"
          label={isRtl ? "تأكيد كلمة المرور" : "Confirm password"}
          autoComplete="new-password"
          required
          errorText={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required,
            validate: (value, values) => value === values.password || (isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"),
          })}
        />
        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" isLoading={isSubmitting} loadingText={isRtl ? "جارٍ إنشاء الحساب..." : "Creating account..."}>
          {isRtl ? "إنشاء الحساب" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--text-secondary)">
        {isRtl ? "لديك حساب بالفعل؟ " : "Already have an account? "}
        <Link className="font-semibold text-(--brand-primary) underline-offset-4 hover:underline" to="/login">
          {isRtl ? "سجّل الدخول" : "Log in"}
        </Link>
      </p>
    </AuthLayout>
  )
}
