import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Button } from "../../../components/ui/button"
import { Input, Textarea } from "../../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/overlay/dialog"
import {
  createDepartment,
  updateDepartment,
  NAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from "../services/department-service"

const EMPTY = { name: "", description: "" }

export function DepartmentFormModal({
  open,
  onOpenChange,
  mode = "create",
  department = null,
  onSuccess,
}) {
  const { t } = useTranslation()
  const isEdit = mode === "edit"

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    if (isEdit && department) {
      reset({
        name: department.name ?? "",
        description: department.description ?? "",
      })
    } else {
      reset(EMPTY)
    }
  }, [open, isEdit, department, reset])

  const onSubmit = handleSubmit(async (values) => {
    const name = values.name.trim()
    const description = values.description?.trim() ?? ""

    try {
      if (isEdit) {
        await updateDepartment(department.id, { name, description })
      } else {
        await createDepartment({ name, description })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      onSuccess?.({ error: err })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("departmentsPage.editModalTitle")
              : t("departmentsPage.createModalTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("departmentsPage.editModalDescription")
              : t("departmentsPage.createModalDescription")}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          <Input
            label={t("departmentsPage.nameLabel")}
            required
            maxLength={NAME_MAX_LENGTH}
            errorText={errors.name?.message}
            {...register("name", {
              required: t("departmentsPage.nameRequired"),
              validate: (value) => {
                if (!value?.trim()) return t("departmentsPage.nameRequired")
                if (value.trim().length > NAME_MAX_LENGTH) {
                  return t("departmentsPage.nameMaxLength", { max: NAME_MAX_LENGTH })
                }
                return true
              },
            })}
          />

          <Textarea
            label={t("departmentsPage.descriptionLabel")}
            maxLength={DESCRIPTION_MAX_LENGTH}
            errorText={errors.description?.message}
            {...register("description", {
              validate: (value) => {
                if (value && value.length > DESCRIPTION_MAX_LENGTH) {
                  return t("departmentsPage.descriptionMaxLength", {
                    max: DESCRIPTION_MAX_LENGTH,
                  })
                }
                return true
              },
            })}
          />

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
              {isEdit ? t("common.save") : t("departmentsPage.createSubmit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
