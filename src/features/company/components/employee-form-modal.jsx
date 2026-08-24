import React, { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { useAuth } from "../../auth/hooks/use-auth"
import { Button } from "../../../components/ui/button"
import { Dropdown } from "../../../components/ui/dropdown"
import { Input } from "../../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/overlay/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import {
  createEmployee,
  updateEmployee,
  CONTRACT_TYPES,
  NATIONAL_ID_LENGTH,
  SALARY_MIN,
} from "../services/employee-service"

const EMPTY = {
  full_name: "",
  email: "",
  job_title: "",
  department_id: "",
  hire_date: "",
  salary: "",
  contract_type: "",
  national_id: "",
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NATIONAL_ID_PATTERN = /^\d{14}$/
const FORM_FIELDS = new Set([
  "full_name",
  "email",
  "job_title",
  "department_id",
  "hire_date",
  "salary",
  "contract_type",
  "national_id",
])

function getDepartmentId(department) {
  return department?.department_id ?? department?.id ?? department?.record_id ?? ""
}

function getDepartmentName(department) {
  return department?.name ?? department?.department_name ?? department?.title ?? ""
}

function getEmployeeRecordId(employee) {
  return employee?.record_id ?? employee?.id
}

function getEmployeeDepartmentId(employee) {
  return (
    employee?.department_id ??
    employee?.department?.department_id ??
    employee?.department?.id ??
    ""
  )
}

function toDateInputValue(value) {
  if (!value) return ""
  return String(value).slice(0, 10)
}

function todayInputValue() {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

export function EmployeeFormModal({
  open,
  onOpenChange,
  mode = "create",
  employee = null,
  departments = [],
  onSuccess,
}) {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const isEdit = mode === "edit"
  // FIX-13: department create is Company_Owner-only, so a fresh company's HR
  // account can hit this modal with nothing to pick from. Editing an existing
  // employee is unaffected — they already have a valid department assigned.
  const hasNoDepartments = !isEdit && departments.length === 0
  const isOwner = currentUser?.role === "Company_Owner" || currentUser?.role === "Owner"

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    if (isEdit && employee) {
      reset({
        full_name: employee.full_name ?? employee.name ?? "",
        email: employee.email ?? "",
        job_title: employee.job_title ?? employee.jobTitle ?? "",
        department_id: getEmployeeDepartmentId(employee),
        hire_date: toDateInputValue(employee.hire_date ?? employee.hireDate),
        salary: employee.salary ?? "",
        contract_type: employee.contract_type ?? employee.contractType ?? "",
        national_id: employee.national_id ?? employee.nationalId ?? "",
      })
    } else {
      reset(EMPTY)
    }
  }, [open, isEdit, employee, reset])

  const applyServerErrors = (err) => {
    let hasFieldError = false

    Object.entries(err?.fieldErrors ?? {}).forEach(([field, message]) => {
      if (!FORM_FIELDS.has(field) || !message) return
      setError(field, { type: "server", message })
      hasFieldError = true
    })

    if (err?.status === 404 && err?.code === "department_not_found") {
      setError("department_id", {
        type: "server",
        message: t("employees.departmentNotFound"),
      })
      hasFieldError = true
    }

    if (err?.status === 409 && err?.code === "email_registered") {
      setError("email", {
        type: "server",
        message: t("employees.emailAlreadyUsed"),
      })
      hasFieldError = true
    }

    if (!hasFieldError) {
      setError("root", {
        type: "server",
        message: err?.message || t("common.error"),
      })
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root")

    const nationalId = values.national_id?.trim() ?? ""
    const sharedPayload = {
      full_name: values.full_name.trim(),
      job_title: values.job_title.trim(),
      department_id: values.department_id,
      hire_date: values.hire_date,
      salary: Number(values.salary),
      contract_type: values.contract_type,
    }

    if (nationalId) {
      sharedPayload.national_id = nationalId
    }

    try {
      const result = isEdit
        ? await updateEmployee(getEmployeeRecordId(employee), sharedPayload)
        : await createEmployee({
            ...sharedPayload,
            email: values.email.trim(),
          })

      onOpenChange(false)
      onSuccess?.(result)
    } catch (err) {
      applyServerErrors(err)
      onSuccess?.({ error: err })
    }
  })

  if (hasNoDepartments) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("employees.formCreateTitle")}</DialogTitle>
          </DialogHeader>

          <div className="rounded-md border border-dashed border-(--border-default) bg-(--bg-card-subtle) p-5 text-start">
            <p className="text-sm font-medium text-(--text-primary)">
              {t("employees.noDepartmentsTitle")}
            </p>
            <p className="mt-1.5 text-sm text-(--text-secondary)">
              {isOwner
                ? t("employees.noDepartmentsDescriptionOwner")
                : t("employees.noDepartmentsDescriptionHr")}
            </p>
            {isOwner && (
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link to="/owner/departments">{t("employees.goToDepartments")}</Link>
              </Button>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("employees.formEditTitle") : t("employees.formCreateTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("employees.formEditDescription")
              : t("employees.formCreateDescription")}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          {errors.root?.message && (
            <div
              role="alert"
              className="rounded-md border border-(--status-error-fg) bg-(--status-error-bg) px-4 py-3 text-sm text-(--status-error-fg)"
            >
              {errors.root.message}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("employees.fullNameLabel")}
              required
              errorText={errors.full_name?.message}
              {...register("full_name", {
                required: t("employees.fullNameRequired"),
                validate: (value) =>
                  value?.trim() ? true : t("employees.fullNameRequired"),
              })}
            />

            <Input
              type="email"
              label={t("employees.emailLabel")}
              required
              readOnly={isEdit}
              disabled={isEdit}
              hintText={isEdit ? t("employees.emailLockedHint") : undefined}
              errorText={errors.email?.message}
              {...register(
                "email",
                isEdit
                  ? {}
                  : {
                      required: t("employees.emailRequired"),
                      validate: (value) => {
                        const email = value?.trim()
                        if (!email) return t("employees.emailRequired")
                        return EMAIL_PATTERN.test(email)
                          ? true
                          : t("employees.emailInvalid")
                      },
                    }
              )}
            />

            <Input
              label={t("employees.jobTitleLabel")}
              required
              errorText={errors.job_title?.message}
              {...register("job_title", {
                required: t("employees.jobTitleRequired"),
                validate: (value) =>
                  value?.trim() ? true : t("employees.jobTitleRequired"),
              })}
            />

            <Controller
              name="department_id"
              control={control}
              rules={{ required: t("employees.departmentRequired") }}
              render={({ field }) => (
                <Dropdown
                  label={t("employees.departmentLabel")}
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                  placeholder={t("employees.departmentLabel")}
                  options={departments}
                  getOptionValue={getDepartmentId}
                  getOptionLabel={(department) =>
                    getDepartmentName(department) || getDepartmentId(department)
                  }
                  errorText={errors.department_id?.message}
                />
              )}
            />

            <Input
              type="date"
              label={t("employees.hireDateLabel")}
              required
              max={todayInputValue()}
              errorText={errors.hire_date?.message}
              {...register("hire_date", {
                required: t("employees.hireDateRequired"),
                validate: (value) => {
                  if (!value) return t("employees.hireDateRequired")
                  return value <= todayInputValue()
                    ? true
                    : t("employees.hireDateFuture")
                },
              })}
            />

            <Input
              type="number"
              label={t("employees.salaryLabel")}
              required
              min={SALARY_MIN}
              step="0.01"
              inputMode="decimal"
              errorText={errors.salary?.message}
              {...register("salary", {
                required: t("employees.salaryRequired"),
                validate: (value) => {
                  if (value === "" || value === null) {
                    return t("employees.salaryRequired")
                  }
                  return Number(value) > SALARY_MIN
                    ? true
                    : t("employees.salaryInvalid")
                },
              })}
            />

            <Controller
              name="contract_type"
              control={control}
              rules={{ required: t("employees.contractTypeRequired") }}
              render={({ field }) => (
                <div className="w-full flex flex-col gap-1.5 text-start">
                  <label className="text-sm font-medium text-(--text-primary) select-none">
                    {t("employees.contractTypeLabel")}
                    <span className="text-(--text-muted) ms-1">*</span>
                  </label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      aria-label={t("employees.contractTypeLabel")}
                      className={
                        errors.contract_type
                          ? "border-(--status-error-fg) focus:border-(--status-error-fg) focus:ring-(--status-error-fg)"
                          : undefined
                      }
                    >
                      <SelectValue placeholder={t("employees.contractTypeLabel")} />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contract_type?.message && (
                    <p className="text-xs text-(--status-error-fg)" role="alert">
                      {errors.contract_type.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Input
              label={t("employees.nationalIdLabel")}
              hintText={t("employees.nationalIdHint")}
              inputMode="numeric"
              maxLength={NATIONAL_ID_LENGTH}
              errorText={errors.national_id?.message}
              {...register("national_id", {
                validate: (value) => {
                  const nationalId = value?.trim()
                  if (!nationalId) return true
                  return NATIONAL_ID_PATTERN.test(nationalId)
                    ? true
                    : t("employees.nationalIdInvalid")
                },
              })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" isLoading={isSubmitting} loadingText={t("common.loading")}>
              {isEdit ? t("common.save") : t("employees.createButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
