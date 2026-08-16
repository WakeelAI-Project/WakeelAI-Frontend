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
  generateLegalClauses,
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

const EMPTY_CLAUSE_GENERATION_FORM = {
  language: "en",
  include_labor_law: true,
  include_company_policy: true,
  instruction: "",
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

function formatClauseCategory(category) {
  const normalized = String(category ?? "").toLowerCase();

  if (normalized === "labor_law" || normalized === "labor-law") {
    return "Labor Law";
  }

  if (normalized === "company_policy" || normalized === "company-policy") {
    return "Company Policy";
  }

  if (normalized === "mixed") {
    return "Mixed Sources";
  }

  return category || "Legal Clause";
}

function formatSourceMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return [];

  return Object.entries(metadata)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    )
    .map(([key, value]) => {
      const normalizedKey = key
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();

      return {
        label: normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1),
        value: typeof value === "string" ? value : JSON.stringify(value),
      };
    });
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
  const [isGenerateClauseDialogOpen, setIsGenerateClauseDialogOpen] =
    useState(false);
  const [generationForm, setGenerationForm] = useState(
    EMPTY_CLAUSE_GENERATION_FORM,
  );
  const [isGeneratingClauses, setIsGeneratingClauses] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("idle");
  const [generationError, setGenerationError] = useState("");
  const [generatedClauses, setGeneratedClauses] = useState([]);
  const [selectedClauseIds, setSelectedClauseIds] = useState([]);
  const [editingClauseId, setEditingClauseId] = useState(null);
  const [editingDraft, setEditingDraft] = useState("");

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

  const insertTextAtCursor = (snippet) => {
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

  const handleGenerateClauses = async () => {
    if (!templateId) return;

    setGenerationError("");
    setIsGeneratingClauses(true);
    setGenerationPhase("context");

    try {
      setGenerationPhase("clauses");
      const response = await generateLegalClauses(templateId, {
        language: generationForm.language,
        include_labor_law: generationForm.include_labor_law,
        include_company_policy: generationForm.include_company_policy,
        instruction: generationForm.instruction,
      });

      const clauses = Array.isArray(response?.clauses) ? response.clauses : [];
      if (!response?.success && clauses.length === 0) {
        setGenerationError(t("templates.errors.noRelevantSources"));
        setGeneratedClauses([]);
        setSelectedClauseIds([]);
        return;
      }

      if (clauses.length === 0) {
        setGenerationError(t("templates.errors.noRelevantSources"));
        setGeneratedClauses([]);
        setSelectedClauseIds([]);
        return;
      }

      setGeneratedClauses(clauses);
      setSelectedClauseIds([clauses[0].id].filter(Boolean));
      setEditingClauseId(null);
      setEditingDraft("");
    } catch (err) {
      const message = getApiErrorMessage(t, err);
      setGenerationError(message);
      setGeneratedClauses([]);
      setSelectedClauseIds([]);
    } finally {
      setIsGeneratingClauses(false);
      setGenerationPhase("idle");
    }
  };

  const handleClauseSelectionToggle = (clauseId) => {
    setSelectedClauseIds((current) =>
      current.includes(clauseId)
        ? current.filter((id) => id !== clauseId)
        : [...current, clauseId],
    );
  };

  const handleEditClauseStart = (clause) => {
    setEditingClauseId(clause.id);
    setEditingDraft(clause.content || "");
  };

  const handleSaveClauseEdit = (clauseId) => {
    const nextDraft = editingDraft.trim();

    setGeneratedClauses((current) =>
      current.map((clause) =>
        clause.id === clauseId
          ? { ...clause, content: nextDraft || clause.content || "" }
          : clause,
      ),
    );

    setEditingClauseId(null);
    setEditingDraft("");
  };

  const handleCancelClauseEdit = () => {
    setEditingClauseId(null);
    setEditingDraft("");
  };

  const handleRejectClause = (clauseId) => {
    setGeneratedClauses((current) =>
      current.filter((clause) => clause.id !== clauseId),
    );
    setSelectedClauseIds((current) => current.filter((id) => id !== clauseId));
  };

  const handleInsertSelectedClauses = () => {
    const selectedClauses = generatedClauses.filter((clause) =>
      selectedClauseIds.includes(clause.id),
    );

    if (selectedClauses.length === 0) {
      toast({
        type: "error",
        message: t("templates.generateLegalClausesInsertEmpty"),
      });
      return;
    }

    const snippet = selectedClauses
      .map(
        (clause) =>
          `\n\n### ${clause.title || "Clause"}\n\n${clause.content || ""}\n\n`,
      )
      .join("");

    insertTextAtCursor(snippet.trim() + "\n\n");
    setIsGenerateClauseDialogOpen(false);
    setGeneratedClauses([]);
    setSelectedClauseIds([]);
    setGenerationError("");
    toast({
      type: "success",
      message: t("templates.generateLegalClausesInserted"),
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
            variant="ai"
            size="sm"
            onClick={() => {
              setGenerationError("");
              setGenerationForm(EMPTY_CLAUSE_GENERATION_FORM);
              setGeneratedClauses([]);
              setSelectedClauseIds([]);
              setEditingClauseId(null);
              setEditingDraft("");
              setIsGenerateClauseDialogOpen(true);
            }}
            disabled={loading || isSubmitting}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("templates.generateLegalClauses")}
          </Button>
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

      <ClauseGenerationDialog
        open={isGenerateClauseDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsGenerateClauseDialogOpen(nextOpen);
          if (!nextOpen) {
            setGenerationError("");
            setGeneratedClauses([]);
            setSelectedClauseIds([]);
            setEditingClauseId(null);
            setEditingDraft("");
          }
        }}
        loading={isGeneratingClauses}
        phase={generationPhase}
        generationError={generationError}
        form={generationForm}
        setForm={setGenerationForm}
        onGenerate={handleGenerateClauses}
        clauses={generatedClauses}
        selectedClauseIds={selectedClauseIds}
        onToggleSelect={handleClauseSelectionToggle}
        onReject={handleRejectClause}
        editingClauseId={editingClauseId}
        editingDraft={editingDraft}
        setEditingDraft={setEditingDraft}
        onEditStart={handleEditClauseStart}
        onSaveEdit={handleSaveClauseEdit}
        onCancelEdit={handleCancelClauseEdit}
        onInsertSelected={handleInsertSelectedClauses}
        t={t}
      />
    </PageShell>
  );
}

function ClauseGenerationDialog({
  open,
  onOpenChange,
  loading,
  phase,
  generationError,
  form,
  setForm,
  onGenerate,
  clauses,
  selectedClauseIds,
  onToggleSelect,
  onReject,
  editingClauseId,
  editingDraft,
  setEditingDraft,
  onEditStart,
  onSaveEdit,
  onCancelEdit,
  onInsertSelected,
  t,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-(--overlay-scrim) flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-lg border border-(--border-default) bg-paper p-0 shadow-(--shadow-3) dark:bg-(--bg-card-raised) dark:border-(--border-emphasis)">
        <div className="border-b border-(--border-default) px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                {t("templates.generateLegalClausesTitle")}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-(--text-primary)">
                {t("templates.generateLegalClauses")}
              </h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}>
              {t("common.close")}
            </Button>
          </div>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          {!clauses.length && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 text-start">
                  <label className="text-sm font-medium text-(--text-primary)">
                    {t("templates.generateLegalClausesLanguage")}
                  </label>
                  <select
                    className="h-10 rounded-sm border border-(--border-default) bg-paper px-3 text-sm text-(--text-primary) focus:outline-none focus:border-(--border-focus)"
                    value={form.language}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        language: event.target.value,
                      }))
                    }
                    aria-label={t("templates.generateLegalClausesLanguage")}>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 rounded-sm border border-(--border-default) bg-(--bg-card-subtle) p-4">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-medium text-(--text-primary)">
                    {t("templates.generateLegalClausesUseLaborLaw")}
                  </label>
                  <Switch
                    checked={Boolean(form.include_labor_law)}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        include_labor_law: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-medium text-(--text-primary)">
                    {t("templates.generateLegalClausesUseCompanyPolicy")}
                  </label>
                  <Switch
                    checked={Boolean(form.include_company_policy)}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        include_company_policy: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Textarea
                label={t("templates.generateLegalClausesInstruction")}
                value={form.instruction}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    instruction: event.target.value,
                  }))
                }
                className="min-h-24"
              />

              {generationError && (
                <Alert
                  variant="error"
                  title={t("templates.generateLegalClausesErrorTitle")}>
                  {generationError}
                </Alert>
              )}

              <div className="flex justify-end gap-2 pb-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}>
                  {t("templates.generateLegalClausesCancel")}
                </Button>
                <Button
                  type="button"
                  variant="ai"
                  isLoading={loading}
                  loadingText={
                    phase === "context"
                      ? t("templates.generateLegalClausesLoadingContext")
                      : t("templates.generateLegalClausesLoadingGenerate")
                  }
                  onClick={onGenerate}
                  disabled={
                    loading ||
                    (!form.include_labor_law && !form.include_company_policy)
                  }>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t("templates.generateLegalClausesGenerate")}
                </Button>
              </div>
            </div>
          )}

          {clauses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                    {t("templates.generateLegalClausesReview")}
                  </p>
                  <h4 className="mt-1 text-base font-semibold text-(--text-primary)">
                    {t("templates.generateLegalClausesReviewTitle")}
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="ai"
                  size="sm"
                  onClick={onGenerate}
                  disabled={loading}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t("templates.generateLegalClausesRegenerate")}
                </Button>
              </div>

              {clauses.map((clause) => {
                const isSelected = selectedClauseIds.includes(clause.id);
                const isEditing = editingClauseId === clause.id;

                return (
                  <div
                    key={clause.id}
                    className="rounded-md border border-(--border-default) bg-(--bg-card-subtle) p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h5 className="text-base font-semibold text-(--text-primary)">
                          {clause.title || "Generated clause"}
                        </h5>
                        <p className="mt-1 text-xs text-(--text-secondary)">
                          {t("templates.generateLegalClausesCategory")}:{" "}
                          {formatClauseCategory(clause.category)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onEditStart(clause)}>
                          {t("templates.generateLegalClausesEdit")}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onReject(clause.id)}>
                          {t("templates.generateLegalClausesReject")}
                        </Button>
                        <Button
                          type="button"
                          variant={isSelected ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => onToggleSelect(clause.id)}>
                          {isSelected
                            ? t("templates.generateLegalClausesSelected")
                            : t("templates.generateLegalClausesSelect")}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <Textarea
                            label={t(
                              "templates.generateLegalClausesClauseText",
                            )}
                            value={editingDraft}
                            onChange={(event) =>
                              setEditingDraft(event.target.value)
                            }
                            className="min-h-28"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={onCancelEdit}>
                              {t("templates.generateLegalClausesCancelEdit")}
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => onSaveEdit(clause.id)}>
                              {t("templates.generateLegalClausesSaveEdit")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-7 text-(--text-primary)">
                          {clause.content}
                        </p>
                      )}
                    </div>

                    {clause.sources?.length > 0 && (
                      <div className="mt-4 border-t border-(--border-default) pt-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                          {t("templates.generateLegalClausesSources")}
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-(--text-secondary)">
                          {clause.sources.map((source) => (
                            <li
                              key={source.id || source.title}
                              className="rounded-sm border border-(--border-default) bg-paper p-2">
                              <div className="font-medium text-(--text-primary)">
                                {source.title || source.type || "Source"}
                              </div>
                              <div className="mt-1 text-xs text-(--text-secondary)">
                                {source.type === "labor-law"
                                  ? "Egyptian Labor Law"
                                  : source.type === "company-policy"
                                    ? "Company Handbook"
                                    : source.type || "Source"}
                              </div>
                              {formatSourceMetadata(source.metadata).map(
                                (entry) => (
                                  <div
                                    key={`${source.id}-${entry.label}`}
                                    className="mt-1 text-xs text-(--text-secondary)">
                                    {entry.label}: {entry.value}
                                  </div>
                                ),
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={onInsertSelected}
                  disabled={selectedClauseIds.length === 0}>
                  {t("templates.generateLegalClausesInsert")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
