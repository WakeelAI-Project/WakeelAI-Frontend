import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Save,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/layout/empty-state";
import { Alert } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input, Textarea } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Switch } from "../components/ui/switch";
import { useToast } from "../components/ui/toast";
import { PlaceholderPalette } from "../features/company/components/templates/placeholder-palette";
import { TemplatePreview } from "../features/company/components/templates/template-preview";
import {
  createTemplate,
  getTemplate,
  isTemplateApiUnavailableError,
  updateTemplate,
} from "../features/company/services/template-service";
import {
  DOCUMENT_TEMPLATE_TYPES,
  getDocumentTypeLabelKey,
  getTemplateContent,
  getTemplateDocumentType,
  getTemplateIsActive,
  getTemplateName,
  TEMPLATE_NAME_MAX_LENGTH,
  validateTemplateContent,
} from "../features/company/templates/template-placeholders";
import { PageShell } from "./page-shell";

const EMPTY_TEMPLATE_FORM = {
  name: "",
  document_type: "Contract",
  content_template: "",
  is_active: false,
};

const FORM_FIELDS = new Set([
  "name",
  "document_type",
  "content_template",
  "is_active",
]);

const FIELD_ALIASES = {
  Name: "name",
  DocumentType: "document_type",
  documentType: "document_type",
  ContentTemplate: "content_template",
  contentTemplate: "content_template",
  IsActive: "is_active",
  isActive: "is_active",
};

function normalizeFieldName(field) {
  if (!field) return null;
  const name = String(field).split(".").pop();
  return FIELD_ALIASES[name] || name;
}

function getResponseMessage(data) {
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.title === "string") return data.title;
  return undefined;
}

function getTemplateErrorCode(error) {
  const data = error?.response?.data;
  return (
    error?.code || data?.code || data?.error_code || data?.error || data?.type
  );
}

function getFieldErrors(error) {
  const data = error?.response?.data;
  const rawErrors =
    error?.fieldErrors ?? data?.errors ?? data?.field_errors ?? {};
  const fieldErrors = {};

  if (!rawErrors || typeof rawErrors !== "object") return fieldErrors;

  Object.entries(rawErrors).forEach(([field, value]) => {
    const normalizedField = normalizeFieldName(field);
    const message = Array.isArray(value)
      ? value[0]
      : value?.message || value?.error || value;

    if (normalizedField && typeof message === "string") {
      fieldErrors[normalizedField] = message;
    }
  });

  return fieldErrors;
}

function getApiErrorMessage(t, error) {
  const status = error?.status ?? error?.response?.status;
  const code = getTemplateErrorCode(error);
  const message = getResponseMessage(error?.response?.data);

  if (isTemplateApiUnavailableError(error))
    return t("templates.errors.backendPending");
  if (status === 400 || status === 422)
    return message || t("templates.errors.validation");
  if (status === 403) return t("templates.errors.forbidden");
  if (status === 404) return t("templates.errors.notFound");
  if (status === 409 && code === "template_active")
    return t("templates.errors.templateActive");
  if (status === 409 && code === "template_required")
    return t("templates.errors.templateRequired");
  if (status === 409) return message || t("templates.errors.conflict");
  if (status >= 500) return t("templates.errors.server");

  return message || error?.message || t("templates.errors.generic");
}

function formatTemplateContentIssue(t, issue) {
  if (!issue) return true;

  if (issue.type === "required")
    return t("templates.validation.contentRequired");
  if (issue.type === "unknown") {
    return t("templates.validation.unknownPlaceholder", { token: issue.token });
  }
  if (issue.type === "unmatched")
    return t("templates.validation.unmatchedBraces");
  if (issue.type === "malformed") {
    return t("templates.validation.malformedPlaceholder", {
      token: "{{employee_name}}",
    });
  }
  if (issue.type === "missingSupported")
    return t("templates.validation.missingSupported");

  return t("templates.validation.contentInvalid");
}

function getLoadErrorCopy(t, error) {
  if (isTemplateApiUnavailableError(error)) {
    return {
      title: t("templates.backendPendingTitle"),
      description: t("templates.backendPendingEditDescription"),
      canRetry: false,
    };
  }

  if (error?.status === 403) {
    return {
      title: t("templates.permissionTitle"),
      description: t("templates.errors.forbidden"),
      canRetry: false,
    };
  }

  if (
    error?.status === 404 ||
    getTemplateErrorCode(error) === "template_not_found"
  ) {
    return {
      title: t("templates.notFoundTitle"),
      description: t("templates.notFoundDescription"),
      canRetry: false,
    };
  }

  return {
    title: t("templates.loadErrorTitle"),
    description: t("templates.errors.generic"),
    canRetry: true,
  };
}

function EditorLoading() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      <Skeleton className="h-110 w-full" />
    </div>
  );
}

export function TemplateEditorPage({ mode = "create" }) {
  const isEdit = mode === "edit";
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const contentRef = useRef(null);

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY_TEMPLATE_FORM });

  const contentValue = useWatch({ control, name: "content_template" });
  const contentIssues = useMemo(
    () => (contentValue?.trim() ? validateTemplateContent(contentValue) : []),
    [contentValue],
  );

  const loadTemplate = useCallback(async () => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const template = await getTemplate(templateId);
      reset({
        name: getTemplateName(template),
        document_type: getTemplateDocumentType(template),
        content_template: getTemplateContent(template),
        is_active: getTemplateIsActive(template),
      });
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [isEdit, reset, templateId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const contentRegister = register("content_template", {
    validate: (value) => {
      const issues = validateTemplateContent(value);
      return issues.length > 0
        ? formatTemplateContentIssue(t, issues[0])
        : true;
    },
  });

  const insertPlaceholder = (token) => {
    const textarea = contentRef.current;
    const currentValue = contentValue ?? "";
    const selectionStart = textarea?.selectionStart ?? currentValue.length;
    const selectionEnd = textarea?.selectionEnd ?? currentValue.length;
    const nextValue = `${currentValue.slice(0, selectionStart)}${token}${currentValue.slice(selectionEnd)}`;
    const nextCursor = selectionStart + token.length;

    setValue("content_template", nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const insertBlock = (snippet) => {
    const textarea = contentRef.current;
    const currentValue = contentValue ?? "";
    const selectionStart = textarea?.selectionStart ?? currentValue.length;
    const selectionEnd = textarea?.selectionEnd ?? currentValue.length;
    const nextValue = `${currentValue.slice(0, selectionStart)}${snippet}${currentValue.slice(selectionEnd)}`;
    const nextCursor = selectionStart + snippet.length;

    setValue("content_template", nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const applyServerErrors = (err) => {
    let hasFieldError = false;
    const fieldErrors = getFieldErrors(err);

    Object.entries(fieldErrors).forEach(([field, message]) => {
      if (!FORM_FIELDS.has(field) || !message) return;
      setError(field, { type: "server", message });
      hasFieldError = true;
    });

    if (!hasFieldError) {
      setError("root", {
        type: "server",
        message: getApiErrorMessage(t, err),
      });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");

    const sharedPayload = {
      name: values.name.trim(),
      content_template: values.content_template,
      is_active: Boolean(values.is_active),
    };

    try {
      if (isEdit) {
        await updateTemplate(templateId, sharedPayload);
        toast({ type: "success", message: t("templates.messages.updated") });
      } else {
        await createTemplate({
          ...sharedPayload,
          document_type: values.document_type,
        });
        toast({ type: "success", message: t("templates.messages.created") });
      }

      navigate("/hr/templates");
    } catch (err) {
      applyServerErrors(err);
    }
  });

  const loadErrorCopy = loadError ? getLoadErrorCopy(t, loadError) : null;

  return (
    <PageShell
      eyebrow={t("templates.eyebrow")}
      title={isEdit ? t("templates.editTitle") : t("templates.createTitle")}
      description={
        isEdit
          ? t("templates.editDescription")
          : t("templates.createDescription")
      }>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-(--border-default) bg-(--bg-card) px-4 py-3 shadow-(--shadow-1)">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/hr/templates")}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t("templates.backToTemplates")}
          </Button>
          {isEdit && (
            <Badge variant="document" shape="pill">
              {t("templates.documentTypeImmutable")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/hr/templates")}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            loadingText={t("common.loading")}
            form={"template-form"}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {isEdit ? t("templates.save") : t("templates.create")}
          </Button>
        </div>
      </div>

      {loading ? (
        <EditorLoading />
      ) : loadError ? (
        <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 shadow-(--shadow-1)">
          <EmptyState
            illustrationType={
              isTemplateApiUnavailableError(loadError) ? "document" : "offline"
            }
            title={loadErrorCopy.title}
            description={loadErrorCopy.description}
            actionText={
              loadErrorCopy.canRetry
                ? t("common.retry")
                : t("templates.backToTemplates")
            }
            onActionClick={
              loadErrorCopy.canRetry
                ? loadTemplate
                : () => navigate("/hr/templates")
            }
          />
        </section>
      ) : (
        <form
          id="template-form"
          className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
          onSubmit={onSubmit}
          noValidate>
          <div className="space-y-5">
            {errors.root?.message && (
              <Alert variant="error" title={t("templates.saveFailed")}>
                {errors.root.message}
              </Alert>
            )}

            <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                <FileText className="h-3.5 w-3.5" />
                Document setup
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t("templates.fields.name")}
                  required
                  maxLength={TEMPLATE_NAME_MAX_LENGTH}
                  errorText={errors.name?.message}
                  {...register("name", {
                    validate: (value) => {
                      const name = value?.trim();
                      if (!name) return t("templates.validation.nameRequired");
                      if (name.length > TEMPLATE_NAME_MAX_LENGTH) {
                        return t("templates.validation.nameMaxLength", {
                          max: TEMPLATE_NAME_MAX_LENGTH,
                        });
                      }
                      return true;
                    },
                  })}
                />

                <Controller
                  name="document_type"
                  control={control}
                  rules={{
                    required: t("templates.validation.documentTypeRequired"),
                  }}
                  render={({ field }) => (
                    <div className="flex w-full flex-col gap-1.5 text-start">
                      <label className="text-sm font-medium text-(--text-primary) select-none">
                        {t("templates.fields.documentType")}
                        <span className="ms-1 text-(--text-muted)">*</span>
                      </label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isEdit || isSubmitting}>
                        <SelectTrigger
                          aria-label={t("templates.fields.documentType")}
                          className={
                            errors.document_type
                              ? "border-(--status-error-fg) focus:border-(--status-error-fg) focus:ring-(--status-error-fg)"
                              : undefined
                          }>
                          <SelectValue
                            placeholder={t("templates.fields.documentType")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TEMPLATE_TYPES.map((documentType) => (
                            <SelectItem key={documentType} value={documentType}>
                              {t(getDocumentTypeLabelKey(documentType))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.document_type?.message && (
                        <p
                          className="text-xs text-(--status-error-fg)"
                          role="alert">
                          {errors.document_type.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="sm:col-span-2 rounded-sm border border-(--border-default) bg-(--bg-card-subtle) p-3">
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        label={
                          field.value
                            ? t("templates.active")
                            : t("templates.inactive")
                        }
                      />
                    </div>
                  )}
                />
              </div>
            </section>

            <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                    Reusable blocks
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-(--text-primary)">
                    Document builder
                  </h3>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["Heading", "\n## Employment Terms\n\n"],
                  [
                    "Paragraph",
                    "\nThis agreement sets out the terms of employment between the employee and the Company.\n\n",
                  ],
                  [
                    "Clause",
                    "\n1. The employee shall perform duties as assigned by the Company in accordance with the agreed role and responsibilities.\n\n",
                  ],
                  [
                    "Bullet list",
                    "\n- Working schedule\n- Confidentiality obligations\n- Reporting line\n\n",
                  ],
                  ["Divider", "\n---\n\n"],
                  [
                    "Signature",
                    "\n\nEmployee Signature: ____________________\nDate: ____________________\n\n",
                  ],
                ].map(([label, snippet]) => (
                  <Button
                    key={label}
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => insertBlock(snippet)}
                    className="justify-start text-left">
                    {label}
                  </Button>
                ))}
              </div>
            </section>

            <PlaceholderPalette
              onInsert={insertPlaceholder}
              disabled={isSubmitting}
            />

            <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                    Template content
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-(--text-primary)">
                    Document builder
                  </h3>
                </div>
                <Badge variant="legal" shape="pill">
                  Grounded with company context
                </Badge>
              </div>

              <Textarea
                label={t("templates.fields.content")}
                required
                className="min-h-80 resize-y font-mono text-[13px] leading-relaxed"
                errorText={errors.content_template?.message}
                {...contentRegister}
                ref={(node) => {
                  contentRegister.ref(node);
                  contentRef.current = node;
                }}
              />

              {contentIssues.length > 0 && (
                <div className="mt-4 rounded-sm border border-(--status-warning-bg) bg-(--status-warning-bg) p-3 text-sm text-(--status-warning-fg)">
                  <p className="mb-2 font-semibold">Template validation</p>
                  <ul className="list-disc space-y-1 ps-5 text-xs">
                    {contentIssues.map((issue, index) => (
                      <li key={`${issue.type}-${issue.token || index}`}>
                        {formatTemplateContentIssue(t, issue)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <div className="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t border-(--border-default) bg-(--bg-page)/95 px-1 py-4 backdrop-blur">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/hr/templates")}
                disabled={isSubmitting}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText={t("common.loading")}>
                <Save className="h-4 w-4" aria-hidden="true" />
                {isEdit ? t("templates.save") : t("templates.create")}
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            <TemplatePreview content={contentValue} />

            <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-4 text-start shadow-(--shadow-1)">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-4 w-4 text-(--ai-primary)"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-(--text-primary)">
                  AI context
                </h3>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                    Company Context
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-(--text-secondary)">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />{" "}
                      Company name
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />{" "}
                      Industry
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />{" "}
                      Working hours
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                    Legal Context
                  </p>
                  <p className="mt-2 text-sm text-(--text-secondary)">
                    Wakeel AI can retrieve relevant Egyptian labor-law context
                    during document generation when the knowledge source is
                    available.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </form>
      )}
    </PageShell>
  );
}
