import React, { useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { FileUpload } from "../../../../components/forms/file-upload";

const normalizeNumber = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

export function MissingFieldsForm({ fields = [], isSending, onSubmit }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});

  const initialValues = useMemo(() => (
    fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {})
  ), [fields]);

  if (!fields.length) return null;

  const setFieldValue = (name, value) => {
    setValues((current) => ({ ...initialValues, ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextValues = { ...initialValues, ...values };
    const nextErrors = {};
    const payload = {};

    fields.forEach((field) => {
      const value = nextValues[field.name];

      if (!value) {
        nextErrors[field.name] = field.inputType === "file"
          ? t("assistant.missingFields.fileUrlRequired")
          : t("validation.required");
        return;
      }

      payload[field.name] = field.inputType === "number" ? normalizeNumber(value) : value;
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-md border border-(--border-default) bg-(--bg-card) p-4 shadow-(--shadow-1)"
    >
      <div className="mb-3 flex items-center gap-2 text-start">
        <UploadCloud className="h-4 w-4 text-(--ai-primary)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">
          {t("assistant.missingFields.title")}
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field) => {
          const value = values[field.name] ?? "";
          const errorText = errors[field.name];

          if (field.inputType === "dropdown") {
            return (
              <div key={field.id} className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-(--text-primary)">
                  {field.label}
                </label>
                <Select value={value} onValueChange={(nextValue) => setFieldValue(field.name, nextValue)}>
                  <SelectTrigger aria-invalid={Boolean(errorText)}>
                    <SelectValue placeholder={t("assistant.missingFields.selectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errorText && <p className="text-xs text-(--status-error-fg)">{errorText}</p>}
              </div>
            );
          }

          if (field.inputType === "file") {
            return (
              <div key={field.id} className="flex flex-col gap-2">
                <FileUpload
                  label={field.label}
                  onFileDrop={(files) => {
                    setSelectedFiles((current) => ({ ...current, [field.name]: files }));
                    setErrors((current) => ({ ...current, [field.name]: null }));
                  }}
                  className="[&>div:nth-child(2)]:h-32"
                />
                {selectedFiles[field.name]?.length > 0 && (
                  <p className="text-xs text-(--text-secondary)">
                    {t("assistant.missingFields.fileUploadPending")}
                  </p>
                )}
                <Input
                  type="url"
                  label={t("assistant.missingFields.fileUrlLabel")}
                  placeholder="https://..."
                  value={value}
                  errorText={errorText}
                  onChange={(event) => setFieldValue(field.name, event.target.value)}
                />
              </div>
            );
          }

          return (
            <Input
              key={field.id}
              type={field.inputType === "date" ? "date" : field.inputType === "number" ? "number" : "text"}
              label={field.label}
              value={value}
              errorText={errorText}
              onChange={(event) => setFieldValue(field.name, event.target.value)}
            />
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" variant="ai" size="sm" isLoading={isSending}>
          {t("assistant.missingFields.continue")}
        </Button>
      </div>
    </form>
  );
}

