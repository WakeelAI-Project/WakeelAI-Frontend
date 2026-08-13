export const DOCUMENT_TEMPLATE_TYPES = Object.freeze([
  "Contract",
  "Warning_Letter",
  "Termination_Letter",
]);

export const TEMPLATE_NAME_MAX_LENGTH = 100;

export const TEMPLATE_PLACEHOLDERS = Object.freeze([
  {
    key: "employee_name",
    token: "{{employee_name}}",
    labelKey: "templates.placeholders.employeeName",
    sample: "Ahmed Hassan",
  },
  {
    key: "job_title",
    token: "{{job_title}}",
    labelKey: "templates.placeholders.jobTitle",
    sample: "Software Engineer",
  },
  {
    key: "department",
    token: "{{department}}",
    labelKey: "templates.placeholders.department",
    sample: "Engineering",
  },
  {
    key: "salary",
    token: "{{salary}}",
    labelKey: "templates.placeholders.salary",
    sample: "15000 EGP",
  },
  {
    key: "hire_date",
    token: "{{hire_date}}",
    labelKey: "templates.placeholders.hireDate",
    sample: "01/01/2026",
  },
  {
    key: "contract_type",
    token: "{{contract_type}}",
    labelKey: "templates.placeholders.contractType",
    sample: "Full-time",
  },
  {
    key: "company_name",
    token: "{{company_name}}",
    labelKey: "templates.placeholders.companyName",
    sample: "Wakeel Company",
  },
  {
    key: "date",
    token: "{{date}}",
    labelKey: "templates.placeholders.date",
    sample: "14/08/2026",
  },
]);

export const TEMPLATE_PLACEHOLDER_KEYS = new Set(
  TEMPLATE_PLACEHOLDERS.map((placeholder) => placeholder.key),
);

export const TEMPLATE_PLACEHOLDER_SAMPLE_VALUES = Object.freeze(
  TEMPLATE_PLACEHOLDERS.reduce((samples, placeholder) => {
    samples[placeholder.key] = placeholder.sample;
    return samples;
  }, {}),
);

const PAIRED_PLACEHOLDER_PATTERN = /\{\{([^{}]*)\}\}/g;
const SINGLE_BRACE_PLACEHOLDER_PATTERN =
  /(^|[^{])\{[a-zA-Z_][a-zA-Z0-9_]*\}\}|\{\{[a-zA-Z_][a-zA-Z0-9_]*\}($|[^}])/;
const VALID_PLACEHOLDER_NAME_PATTERN = /^[a-z_]+$/;

export function getDocumentTypeLabelKey(documentType) {
  return `templates.documentTypes.${documentType}`;
}

export function getTemplateId(template) {
  return template?.template_id ?? template?.templateId ?? template?.id ?? null;
}

export function getTemplateDocumentType(template) {
  return template?.document_type ?? template?.documentType ?? "";
}

export function getTemplateName(template) {
  return template?.name ?? "";
}

export function getTemplateContent(template) {
  return template?.content_template ?? template?.contentTemplate ?? "";
}

export function getTemplateIsActive(template) {
  return template?.is_active ?? template?.isActive ?? false;
}

export function validateTemplateContent(content) {
  const source = content ?? "";
  const issues = [];

  if (!source.trim()) {
    return [{ type: "required" }];
  }

  const pairedMatches = [...source.matchAll(PAIRED_PLACEHOLDER_PATTERN)];
  let supportedPlaceholderCount = 0;

  pairedMatches.forEach((match) => {
    const token = match[0];
    const key = match[1];

    if (!VALID_PLACEHOLDER_NAME_PATTERN.test(key)) {
      issues.push({ type: "malformed", token });
      return;
    }

    if (!TEMPLATE_PLACEHOLDER_KEYS.has(key)) {
      issues.push({ type: "unknown", token, key });
      return;
    }

    supportedPlaceholderCount += 1;
  });

  const contentWithoutPairedPlaceholders = source.replace(PAIRED_PLACEHOLDER_PATTERN, "");
  if (
    contentWithoutPairedPlaceholders.includes("{{") ||
    contentWithoutPairedPlaceholders.includes("}}")
  ) {
    issues.push({ type: "unmatched" });
  }

  if (SINGLE_BRACE_PLACEHOLDER_PATTERN.test(source)) {
    issues.push({ type: "malformed" });
  }

  if (supportedPlaceholderCount === 0) {
    issues.push({ type: "missingSupported" });
  }

  return issues;
}

export function buildTemplatePreviewSegments(content) {
  const source = content ?? "";
  const segments = [];
  let lastIndex = 0;

  for (const match of source.matchAll(PAIRED_PLACEHOLDER_PATTERN)) {
    const [token, key] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({
        type: "text",
        value: source.slice(lastIndex, index),
      });
    }

    if (TEMPLATE_PLACEHOLDER_KEYS.has(key)) {
      segments.push({
        type: "resolved",
        token,
        value: TEMPLATE_PLACEHOLDER_SAMPLE_VALUES[key],
      });
    } else {
      segments.push({
        type: "unresolved",
        token,
        value: token,
      });
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < source.length) {
    segments.push({
      type: "text",
      value: source.slice(lastIndex),
    });
  }

  return segments;
}
