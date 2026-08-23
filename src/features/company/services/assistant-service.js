import api from "../../../lib/api";

export const CONVERSATION_LIST_STATUS = {
  READY: "ready",
  PENDING_BACKEND_CONTRACT: "pending_backend_contract",
};

const ASSISTANT_CONTINUE_MESSAGE = "Continue";

const createFallbackId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const pick = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }
  return undefined;
};

const stringifyValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export function normalizeSource(rawSource, index = 0) {
  if (typeof rawSource === "string") {
    return {
      id: rawSource || `source-${index + 1}`,
      title: rawSource,
      type: null,
      section: null,
      article: null,
      relevance: null,
      url: null,
      content: null,
      metadata: {},
    };
  }

  const metadata = rawSource?.metadata && typeof rawSource.metadata === "object"
    ? rawSource.metadata
    : {};

  return {
    id: stringifyValue(pick(rawSource, ["id", "source_id", "sourceId"])) || `source-${index + 1}`,
    title: pick(rawSource, ["title", "name"]) || pick(metadata, ["title", "document_title"]) || null,
    type: pick(rawSource, ["type", "source_type", "sourceType"]) || pick(metadata, ["type", "knowledgeType"]) || null,
    section: pick(rawSource, ["section", "section_number", "sectionNumber"]) || pick(metadata, ["section", "section_number", "sectionNumber"]) || null,
    article: pick(rawSource, ["article", "article_number", "articleNumber"]) || pick(metadata, ["article", "article_number", "articleNumber"]) || null,
    relevance: pick(rawSource, ["relevance", "confidence", "score"]) || pick(metadata, ["relevance", "similarityScore", "score"]) || null,
    url: pick(rawSource, ["url", "href", "link"]) || pick(metadata, ["url", "href", "link"]) || null,
    content: pick(rawSource, ["content", "excerpt", "snippet"]) || null,
    metadata,
  };
}

export function normalizeSources(rawSources) {
  return toArray(rawSources).map(normalizeSource).filter((source) => source.title || source.id);
}

export function normalizeMissingFields(rawMissingFields) {
  const fields = Array.isArray(rawMissingFields)
    ? rawMissingFields
    : Array.isArray(rawMissingFields?.fields)
      ? rawMissingFields.fields
      : rawMissingFields && typeof rawMissingFields === "object"
        ? Object.values(rawMissingFields)
        : [];

  return fields
    .map((field, index) => {
      if (!field || typeof field !== "object") return null;
      const name = pick(field, ["field_name", "fieldName", "name"]);
      const inputType = pick(field, ["input_type", "inputType", "type"]) || "text";

      if (!name) return null;

      return {
        id: stringifyValue(pick(field, ["id"])) || `${name}-${index}`,
        name: stringifyValue(name),
        inputType: stringifyValue(inputType),
        label: stringifyValue(pick(field, ["label", "title"])) || stringifyValue(name),
        options: toArray(pick(field, ["options", "choices"])).map(stringifyValue).filter(Boolean),
      };
    })
    .filter(Boolean);
}

export function normalizeResultCard(rawCard) {
  if (!rawCard || typeof rawCard !== "object" || !rawCard.type) return null;

  if (rawCard.type === "calculation") {
    return {
      type: "calculation",
      calculationType: pick(rawCard, ["calculation_type", "calculationType"]) || null,
      inputs: rawCard.inputs && typeof rawCard.inputs === "object" ? rawCard.inputs : {},
      result: pick(rawCard, ["result", "final_result", "finalResult"]) ?? null,
      currency: pick(rawCard, ["currency"]) || null,
      breakdown: toArray(rawCard.breakdown).map(stringifyValue).filter(Boolean),
    };
  }

  if (rawCard.type === "document_draft") {
    return {
      type: "document_draft",
      docId: pick(rawCard, ["doc_id", "docId", "document_id", "documentId"]) || null,
      docType: pick(rawCard, ["doc_type", "docType", "document_type", "documentType"]) || null,
      employeeId: pick(rawCard, ["employee_id", "employeeId"]) || null,
      employeeName: pick(rawCard, ["employee_name", "employeeName"]) || null,
    };
  }

  if (rawCard.type === "leave_draft") {
    return {
      type: "leave_draft",
      requestId: pick(rawCard, ["request_id", "requestId"]) || null,
      leaveType: pick(rawCard, ["leave_type", "leaveType"]) || null,
      startDate: pick(rawCard, ["start_date", "startDate"]) || null,
      endDate: pick(rawCard, ["end_date", "endDate"]) || null,
      daysRequested: pick(rawCard, ["days_requested", "daysRequested", "days"]) ?? null,
      attachmentUploaded: pick(rawCard, ["attachment_uploaded", "attachmentUploaded"]) ?? null,
      actions: toArray(rawCard.actions).map(stringifyValue).filter(Boolean),
    };
  }

  return {
    type: stringifyValue(rawCard.type),
    raw: rawCard,
  };
}

export function normalizeChatMessageDto(rawMessage, fallbackConversationId) {
  const role = rawMessage?.role === "assistant" || rawMessage?.role === "ai" ? "assistant" : "user";
  const content = role === "assistant"
    ? pick(rawMessage, ["reply", "content", "message"]) || ""
    : pick(rawMessage, ["content", "message"]) || "";

  return {
    id: stringifyValue(pick(rawMessage, ["chat_id", "chatId", "messageId", "message_id", "id"])) || createFallbackId(role),
    conversationId: pick(rawMessage, ["conversation_id", "conversationId"]) || fallbackConversationId || null,
    role,
    content: stringifyValue(content),
    createdAt: pick(rawMessage, ["created_at", "createdAt"]) || new Date().toISOString(),
    sources: role === "assistant" ? normalizeSources(rawMessage?.sources) : [],
    missingFields: role === "assistant" ? normalizeMissingFields(rawMessage?.missing_fields ?? rawMessage?.missingFields) : [],
    resultCard: role === "assistant" ? normalizeResultCard(rawMessage?.result_card ?? rawMessage?.resultCard) : null,
  };
}

export function normalizeChatResponseDto(rawResponse) {
  const conversationId = pick(rawResponse, ["conversation_id", "conversationId"]) || null;

  return normalizeChatMessageDto(
    {
      ...rawResponse,
      role: "assistant",
      content: pick(rawResponse, ["reply", "message", "content"]) || "",
    },
    conversationId,
  );
}

export function normalizeHistoryResponseDto(rawResponse, requestedConversationId) {
  const conversationId = pick(rawResponse, ["conversation_id", "conversationId"]) || requestedConversationId;
  const targetEmployeeId = pick(rawResponse, ["target_employee_id", "targetEmployeeId"]) || null;
  const targetEmployeeName = pick(rawResponse, ["target_employee_name", "targetEmployeeName"]) || null;
  const messages = toArray(rawResponse?.messages ?? rawResponse?.items ?? rawResponse?.data)
    .map((message) => normalizeChatMessageDto(message, conversationId));

  return {
    conversationId,
    targetEmployeeId,
    targetEmployeeName,
    messages,
    pagination: rawResponse?.pagination || null,
  };
}

export function normalizeAssistantError(error) {
  if (error?.isAssistantError) return error;

  const status = error?.response?.status || null;
  const retryAfterHeader = error?.response?.headers?.["retry-after"];
  const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : null;

  let code = "network_error";
  if (status === 400 || status === 422) code = "validation_error";
  else if (status === 401) code = "unauthorized";
  else if (status === 403) code = "forbidden";
  else if (status === 404) code = "not_found";
  else if (status === 409) code = "conflict";
  else if (status === 429) code = "rate_limited";
  else if (status >= 500) code = "service_unavailable";

  return {
    isAssistantError: true,
    code,
    status,
    retryable: !status || status === 408 || status === 429 || status >= 500,
    retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
  };
}

/**
 * @param {{
 *   conversationId?: string | null,
 *   message: string,
 *   language?: "AR" | "EN",
 *   fieldValues?: Record<string, unknown> | null
 * }} payload
 */
export async function sendMessage(payload) {
  const fieldValues = payload.fieldValues && Object.keys(payload.fieldValues).length > 0
    ? payload.fieldValues
    : null;

  // The .NET gateway serializes null properties explicitly when building the
  // internal Node.js payload (JsonContent.Create uses default options that
  // include null values).  The Node.js AI service validates with Zod schemas
  // where .optional() accepts `T | undefined` but NOT `T | null`.
  //
  // Fix: always send `field_values` as an object so .NET forwards a non-null
  // value ({} when empty, actual values otherwise).  An empty record is
  // semantically equivalent to "no supplementary field values".
  //
  // `language` is always "AR" | "EN" from getRequestLanguage(), but we guard
  // with a fallback to prevent the rare undefined case from also serialising
  // to null on the Node.js side.
  const body = {
    message: payload.message?.trim() || ASSISTANT_CONTINUE_MESSAGE,
    language: payload.language ?? "EN",
    ...(payload.conversationId ? { conversation_id: payload.conversationId } : {}),
    field_values: fieldValues ?? {},
  };

  try {
    const response = await api.post("/ai/chat", body);
    return normalizeChatResponseDto(response.data);
  } catch (error) {
    throw normalizeAssistantError(error);
  }
}

export async function getChatHistory(conversationId, { page = 1, limit = 50 } = {}) {
  if (!conversationId) {
    return { conversationId: null, messages: [], pagination: null };
  }

  try {
    const response = await api.get("/ai/chat/history", {
      params: {
        conversation_id: conversationId,
        page,
        limit,
      },
    });
    return normalizeHistoryResponseDto(response.data, conversationId);
  } catch (error) {
    throw normalizeAssistantError(error);
  }
}

/**
 * Normalizes a single conversation record from the backend list response.
 * The backend returns { conversationId, role, createdAt, updatedAt }.
 * The frontend store expects { id, title, lastMessage, createdAt, updatedAt }.
 */
export function normalizeConversationDto(rawConversation) {
  const id = pick(rawConversation, ["conversationId", "conversation_id", "id"]) || null;
  const createdAt = pick(rawConversation, ["createdAt", "created_at"]) || new Date().toISOString();
  const updatedAt = pick(rawConversation, ["updatedAt", "updated_at"]) || createdAt;
  const title = pick(rawConversation, ["title"]) || "New conversation";

  return {
    id,
    title,
    lastMessage: "",
    createdAt,
    updatedAt,
    targetEmployeeId: rawConversation.targetEmployeeId || null,
    targetEmployeeName: rawConversation.targetEmployeeName || null,
  };
}

export async function getConversations({ page = 1, limit = 50 } = {}) {
  try {
    const response = await api.get("/ai/chat/conversations", {
      params: { page, limit },
    });

    const raw = response.data;
    const conversations = toArray(raw?.conversations ?? raw?.items ?? raw?.data)
      .map(normalizeConversationDto)
      .filter((c) => Boolean(c.id));

    return {
      conversations,
      status: CONVERSATION_LIST_STATUS.READY,
      pagination: raw?.pagination || null,
    };
  } catch (error) {
    throw normalizeAssistantError(error);
  }
}

export async function deleteConversation(conversationId) {
  if (!conversationId) return false;
  
  try {
    await api.delete(`/ai/chat/conversations/${conversationId}`);
    return true;
  } catch (error) {
    throw normalizeAssistantError(error);
  }
}
