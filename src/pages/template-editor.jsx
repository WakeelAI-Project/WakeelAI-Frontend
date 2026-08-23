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
import { cn } from "../lib/utils";
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
  clause_type: "",
  include_labor_law: true,
  include_company_policy: true,
  instruction: "",
};

const BOILERPLATE_TEMPLATES = {
  en: {
    Contract: `## Employment Contract

This Employment Contract is made on {{date}} between {{company_name}} ("the Company") and {{employee_name}} ("the Employee").

1. Position: The Employee is engaged as {{job_title}} in the {{department}} department.
2. Commencement: Employment begins on {{hire_date}} under a {{contract_type}} contract.
3. Remuneration: The Company shall pay the Employee a gross monthly salary of {{salary}} EGP.
4. Working Hours & Leave: Working hours and leave entitlements are governed by Egyptian Labor Law (Law No. 12 of 2003).
5. Obligations: The Employee shall perform the duties of the role diligently and maintain confidentiality of Company information.
6. Termination: Either party may terminate this contract in accordance with the notice periods set by Egyptian Labor Law.

Employee Signature: ____________________    Date: ____________________
For the Company: ____________________       Date: ____________________`,

    Warning_Letter: `## Warning Letter

Date: {{date}}
To: {{employee_name}} — {{job_title}}, {{department}}
From: {{company_name}} — Human Resources

Dear {{employee_name}},

This letter serves as an official written warning regarding [describe the specific incident/conduct here].

1. Nature of the issue: [Describe the policy or conduct that was violated].
2. Expected corrective action: [State the required improvement and timeframe].
3. Consequences: Failure to correct this matter may lead to further disciplinary action, up to and including termination, in accordance with Egyptian Labor Law.

We trust you will treat this matter with the seriousness it requires.

Employee Acknowledgement: ____________________    Date: ____________________
HR Representative: ____________________            Date: ____________________`,

    Termination_Letter: `## Termination Letter

Date: {{date}}
To: {{employee_name}} — {{job_title}}, {{department}}
From: {{company_name}} — Human Resources

Dear {{employee_name}},

This letter is to formally notify you that your employment with {{company_name}} will be terminated effective [termination date].

1. Reason for termination: [State the reason for termination].
2. Notice period: This termination is issued in accordance with the notice period required under Egyptian Labor Law.
3. End-of-service settlement: Your end-of-service entitlements and final salary settlement will be calculated in accordance with Egyptian Labor Law and paid on your final working day.
4. Company property: Please return all Company property and complete the clearance/handover process.

We thank you for your service and wish you success in your future endeavors.

HR Representative: ____________________    Date: ____________________`,
  },
  ar: {
    Contract: `## عقد عمل فردي

تم إبرام هذا العقد في يوم {{date}} بين كل من:
الطرف الأول: {{company_name}} (ويشار إليها فيما بعد بـ "الشركة")
الطرف الثاني: السيد/السيدة {{employee_name}} (ويشار إليه فيما بعد بـ "الموظف")

١. المسمى الوظيفي: يعين الموظف بوظيفة {{job_title}} في قسم {{department}}.
٢. تاريخ بدء العمل: يبدأ العمل اعتباراً من {{hire_date}} بنظام عقد {{contract_type}}.
٣. الراتب والبدلات: تلتزم الشركة بسداد راتب شهري إجمالي قدره {{salary}} جنيه مصري.
٤. ساعات العمل والإجازات: تخضع ساعات العمل والإجازات لأحكام قانون العمل المصري رقم 12 لسنة 2003 وتعديلاته ولائحة الشركة الداخلية.
٥. التزامات الموظف: يتعهد الموظف بأداء مهام عمله بدقة وأمانة والحفاظ التام على سرية بيانات ومعلومات الشركة.
٦. إنهاء العقد: يجوز لأي من الطرفين إنهاء هذا العقد وفقاً للمدد والإخطارات المحددة في قانون العمل المصري.

توقيع الموظف: ____________________    التاريخ: ____________________
عن الشركة: ____________________       التاريخ: ____________________`,

    Warning_Letter: `## خطاب إنذار كتابي

التاريخ: {{date}}
إلى: {{employee_name}} — {{job_title}}، {{department}}
من: {{company_name}} — إدارة الموارد البشرية

تحية طيبة وبعد،

يوجه هذا الإنذار الرسمي إليكم بشأن [اذكر الواقعة أو المخالفة المحددة هنا].

١. طبيعة المخالفة: [اذكر السياسة أو السلوك المخالف وفقاً للائحة العمل].
٢. الإجراء التصحيحي المطلوب: [حدد المطلوب تنفيذه والمهلة الزمنية الممنوحة].
٣. الآثار المترتبة: نود التنبيه إلى أن تكرار هذا التصرف أو عدم تداركه سيعرضكم لاتخاذ إجراءات تأديبية أشد تصل إلى إنهاء التعاقد وفقاً لقانون العمل المصري رقم 12 لسنة 2003.

نأمل منكم الالتزام وحسن التعاون لتفادي أي إجراءات أخرى مستقبلاً.

توقيع الموظف بالعلم: ____________________    التاريخ: ____________________
مسؤول الموارد البشرية: ____________________    التاريخ: ____________________`,

    Termination_Letter: `## إخطار بإنهاء علاقة العمل

التاريخ: {{date}}
إلى: {{employee_name}} — {{job_title}}، {{department}}
من: {{company_name}} — إدارة الموارد البشرية

السيد/السيدة {{employee_name}}،

نحيطكم علماً بقرار إنهاء خدمتكم لدى {{company_name}} اعتباراً من تاريخ [تاريخ إنهاء الخدمة].

١. سبب إنهاء التعاقد: [اذكر سبب إنهاء الخدمة وفقاً لقانون العمل].
٢. مهلة الإخطار: تم منحكم مهلة الإخطار القانونية المقررة وفقاً لأحكام قانون العمل المصري.
٣. مستحقات نهاية الخدمة: سيتم تسوية كافة المستحقات المالية والرواتب المتبقية ومكافأة نهاية الخدمة وصرفها عند إتمام إخلاء الطرف.
٤. عهد وممتلكات الشركة: يرجى تسليم كافة العهد والأجهزة والمستندات الخاصة بالشركة واستكمال إجراءات تسليم العمل.

نشكركم على جهودكم خلال فترة عملكم ونتمنى لكم التوفيق في مسيرتكم المهنية.

مسؤول الموارد البشرية: ____________________    التاريخ: ____________________`,
  },
};

// Backward-compatibility aliases
BOILERPLATE_TEMPLATES.Contract = BOILERPLATE_TEMPLATES.en.Contract;
BOILERPLATE_TEMPLATES.Warning_Letter = BOILERPLATE_TEMPLATES.en.Warning_Letter;
BOILERPLATE_TEMPLATES.Termination_Letter = BOILERPLATE_TEMPLATES.en.Termination_Letter;

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

  // Holds the id once the template exists (edit mode: from route; create mode: after save)
  const [ensuredTemplateId, setEnsuredTemplateId] = useState(templateId ?? null);
  const [boilerplateLang, setBoilerplateLang] = useState("en");

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
    getValues,
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

  /**
   * Quick Start insertion: specifically prepends the boilerplate content at the TOP
   * of the template, preserving any existing content underneath.
   */
  const handleInsertQuickStart = (docType) => {
    setValue("document_type", docType, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const quickStartContent =
      BOILERPLATE_TEMPLATES[boilerplateLang]?.[docType] ||
      BOILERPLATE_TEMPLATES.en[docType] ||
      "";

    if (!quickStartContent) return;

    const existingContent = getValues("content_template") || "";
    const trimmedExisting = existingContent.trim();

    // Prepend Quick Start content to the top, preserving existing content below
    const nextContent = trimmedExisting
      ? `${quickStartContent}\n\n${trimmedExisting}`
      : quickStartContent;

    setValue("content_template", nextContent, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    // Focus and position the cursor after the inserted Quick Start block
    window.requestAnimationFrame(() => {
      const textarea = contentRef.current;
      if (textarea) {
        textarea.focus();
        const cursorPosition = quickStartContent.length + (trimmedExisting ? 2 : 0);
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  };

  const handleGenerateClauses = async () => {
    setGenerationError("");

    if (!generationForm.clause_type) {
      setGenerationError(t("templates.generateLegalClausesClauseTypeRequired"));
      return;
    }

    setIsGeneratingClauses(true);
    setGenerationPhase("context");

    try {
      setGenerationPhase("clauses");
      const currentValues = getValues();
      const response = await generateLegalClauses(templateId || null, {
        language: generationForm.language,
        clause_type: generationForm.clause_type,
        document_type: generationForm.clause_type,
        template_name: currentValues.name || generationForm.clause_type,
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

    const payload = {
      name: values.name.trim(),
      document_type: values.document_type,
      content_template: values.content_template,
      is_active: Boolean(values.is_active),
    };

    try {
      if (isEdit) {
        await updateTemplate(templateId, payload);
        toast({ type: "success", message: t("templates.messages.updated") });
      } else {
        const created = await createTemplate(payload);
        setEnsuredTemplateId(created?.template_id ?? created?.templateId ?? created?.id ?? null);
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
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-md border border-(--border-default) bg-(--bg-card)/95 px-4 py-3 shadow-(--shadow-1) backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/hr/templates")}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t("templates.backToTemplates")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ai"
              size="md"
              onClick={() => {
                setGenerationError("");
                setGenerationForm({
                  ...EMPTY_CLAUSE_GENERATION_FORM,
                  clause_type: getValues("document_type") || "",
                });
                setGeneratedClauses([]);
                setSelectedClauseIds([]);
                setEditingClauseId(null);
                setEditingDraft("");
                setIsGenerateClauseDialogOpen(true);
              }}
              disabled={loading || isSubmitting}
              className="ring-2 ring-(--ai-primary)/30 ring-offset-2 ring-offset-(--bg-card)">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("templates.generateLegalClauses")}
              <span className="ms-0.5 rounded-full bg-(--text-on-accent)/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                AI
              </span>
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
                        disabled={isSubmitting}>
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
                      <p className="mt-2 text-xs text-(--text-secondary)">
                        {t("templates.activeTemplateRuleDescription")}
                      </p>
                    </div>
                  )}
                />
              </div>
            </section>

            <section className="rounded-md border border-(--border-default) bg-(--bg-card) p-5 text-start shadow-(--shadow-1)">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                    Quick start
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-(--text-primary)">
                    Insert standard boilerplate
                  </h3>
                </div>
                <div className="flex items-center gap-1 rounded-sm border border-(--border-default) bg-(--bg-page-alt) p-0.5">
                  <button
                    type="button"
                    onClick={() => setBoilerplateLang("en")}
                    className={cn(
                      "rounded-xs px-2 py-0.5 text-xs font-medium transition-colors",
                      boilerplateLang === "en"
                        ? "bg-(--bg-card) text-(--text-primary) shadow-(--shadow-1)"
                        : "text-(--text-muted) hover:text-(--text-primary)"
                    )}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoilerplateLang("ar")}
                    className={cn(
                      "rounded-xs px-2 py-0.5 text-xs font-medium transition-colors",
                      boilerplateLang === "ar"
                        ? "bg-(--bg-card) text-(--text-primary) shadow-(--shadow-1)"
                        : "text-(--text-muted) hover:text-(--text-primary)"
                    )}
                  >
                    العربية
                  </button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {(boilerplateLang === "ar"
                  ? [
                      ["عقد عمل فردي", "Contract"],
                      ["خطاب إنذار كتابي", "Warning_Letter"],
                      ["إخطار بإنهاء العمل", "Termination_Letter"],
                    ]
                  : [
                      ["Employment Contract", "Contract"],
                      ["Warning Letter", "Warning_Letter"],
                      ["Termination Letter", "Termination_Letter"],
                    ]
                ).map(([label, docType]) => (
                  <Button
                    key={`${boilerplateLang}-${docType}`}
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleInsertQuickStart(docType)}
                    className="justify-start text-left">
                    {label}
                  </Button>
                ))}
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
        onClauseTypeChange={(nextType) => {
          setGenerationForm((current) => ({
            ...current,
            clause_type: nextType,
          }));
          setValue("document_type", nextType, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
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
  onClauseTypeChange,
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

                <div className="flex flex-col gap-1.5 text-start">
                  <label className="text-sm font-medium text-(--text-primary)">
                    {t("templates.generateLegalClausesClauseType")}
                    <span className="ms-1 text-(--text-muted)">*</span>
                  </label>
                  <select
                    className="h-10 rounded-sm border border-(--border-default) bg-paper px-3 text-sm text-(--text-primary) focus:outline-none focus:border-(--border-focus)"
                    value={form.clause_type}
                    onChange={(event) => {
                      const nextType = event.target.value;
                      if (onClauseTypeChange) {
                        onClauseTypeChange(nextType);
                      } else {
                        setForm((current) => ({
                          ...current,
                          clause_type: nextType,
                        }));
                      }
                    }}
                    aria-label={t("templates.generateLegalClausesClauseType")}>
                    <option value="" disabled>
                      {t("templates.generateLegalClausesClauseTypePlaceholder")}
                    </option>
                    {DOCUMENT_TEMPLATE_TYPES.map((documentType) => (
                      <option key={documentType} value={documentType}>
                        {t(getDocumentTypeLabelKey(documentType))}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-(--text-secondary)">
                    {t("templates.generateLegalClausesClauseTypeHint")}
                  </p>
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
                    !form.clause_type ||
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
