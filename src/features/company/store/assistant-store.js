import { create } from "zustand";
import {
  CONVERSATION_LIST_STATUS,
  getChatHistory,
  getConversations,
  normalizeAssistantError,
  sendMessage as sendAssistantMessage,
  deleteConversation as deleteConversationService,
} from "../services/assistant-service";

const createLocalId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingHistory: false,
  isLoadingConversations: false,
  isSending: false,
  error: null,
  retryableMessage: null,
  pendingMissingFields: null,
  progressiveMessageId: null,
  conversationListStatus: CONVERSATION_LIST_STATUS.READY,
  targetContext: null,
};

const deriveConversationTitle = (messages, fallback) => {
  const firstUserMessage = messages.find(
    (message) => message.role === "user" && message.content?.trim(),
  );
  const source = firstUserMessage?.content || fallback || "New conversation";
  return source.length > 48 ? `${source.slice(0, 45)}...` : source;
};

const upsertConversation = (conversations, conversation) => {
  if (!conversation?.id) return conversations;

  const existing = conversations.find((item) => item.id === conversation.id);
  const nextConversation = {
    ...existing,
    ...conversation,
    title: conversation.title || existing?.title || "New conversation",
    updatedAt: conversation.updatedAt || new Date().toISOString(),
  };

  return [
    nextConversation,
    ...conversations.filter((item) => item.id !== conversation.id),
  ];
};

const getPendingFieldsFromMessages = (messages) => {
  const lastAssistantWithFields = [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" && message.missingFields?.length > 0,
    );

  if (!lastAssistantWithFields) return null;

  return {
    messageId: lastAssistantWithFields.id,
    fields: lastAssistantWithFields.missingFields,
  };
};

export const useAssistantStore = create((set, get) => ({
  ...initialState,

  loadConversations: async () => {
    set({ isLoadingConversations: true, error: null });

    try {
      const result = await getConversations();
      set((state) => ({
        conversations:
          result.status === CONVERSATION_LIST_STATUS.PENDING_BACKEND_CONTRACT
            ? state.conversations
            : result.conversations || [],
        conversationListStatus: result.status || CONVERSATION_LIST_STATUS.READY,
        isLoadingConversations: false,
      }));
    } catch (error) {
      set({
        error: normalizeAssistantError(error),
        isLoadingConversations: false,
      });
    }
  },

  startNewConversation: () => {
    set({
      activeConversationId: null,
      messages: [],
      error: null,
      retryableMessage: null,
      pendingMissingFields: null,
      progressiveMessageId: null,
      isLoadingHistory: false,
      targetContext: null,
    });
  },

  setTargetContext: (targetContext) => {
    set({ targetContext });
  },

  selectConversation: async (conversationId) => {
    if (!conversationId) return;

    set({
      activeConversationId: conversationId,
      messages: [],
      isLoadingHistory: true,
      error: null,
      retryableMessage: null,
      pendingMissingFields: null,
      progressiveMessageId: null,
      // Clear stale targetContext immediately when switching conversations.
      // Will be restored from the persisted conversation once history loads.
      targetContext: null,
    });

    try {
      const history = await getChatHistory(conversationId);
      const messages = history.messages || [];

      set((state) => {
        // Find this conversation in the list (normalized by getConversations / upsert)
        // to restore its persisted target employee context.
        const existing = state.conversations.find((c) => c.id === conversationId);
        const restoredTargetId = history.targetEmployeeId || existing?.targetEmployeeId || null;
        const restoredTargetName = history.targetEmployeeName || existing?.targetEmployeeName || null;
        const restoredTargetContext = restoredTargetId
          ? { targetEmployeeId: restoredTargetId, targetEmployeeName: restoredTargetName }
          : null;

        return {
          messages,
          isLoadingHistory: false,
          pendingMissingFields: getPendingFieldsFromMessages(messages),
          targetContext: restoredTargetContext,
          conversations: upsertConversation(state.conversations, {
            id: conversationId,
            title: deriveConversationTitle(messages),
            lastMessage: messages[messages.length - 1]?.content || "",
            targetEmployeeId: restoredTargetId,
            targetEmployeeName: restoredTargetName,
            updatedAt:
              messages[messages.length - 1]?.createdAt ||
              new Date().toISOString(),
          }),
        };
      });
    } catch (error) {
      set({
        error: normalizeAssistantError(error),
        isLoadingHistory: false,
      });
    }
  },

  deleteConversation: async (conversationId) => {
    if (!conversationId) return false;

    // Optimistically update UI
    const currentConversations = get().conversations;
    const activeId = get().activeConversationId;

    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      ...(activeId === conversationId
        ? { activeConversationId: null, messages: [] }
        : {}),
    }));

    try {
      await deleteConversationService(conversationId);
      return true;
    } catch (error) {
      // Revert if failed
      set({
        conversations: currentConversations,
        ...(activeId === conversationId
          ? { activeConversationId: activeId }
          : {}),
        error: normalizeAssistantError(error),
      });
      return false;
    }
  },

  sendMessage: async ({
    message,
    language,
    fieldValues = null,
    displayMessage,
    appendUserMessage = true,
  }) => {
    const trimmedMessage = message?.trim() || "";
    const targetContext = get().targetContext;
    const finalFieldValues = { ...fieldValues, ...targetContext };
    const hasFieldValues = finalFieldValues && Object.keys(finalFieldValues).length > 0;

    if (get().isSending || (!trimmedMessage && !hasFieldValues)) {
      return null;
    }

    const activeConversationId = get().activeConversationId;
    const createdAt = new Date().toISOString();
    const userMessage = appendUserMessage
      ? {
          id: createLocalId("user"),
          conversationId: activeConversationId,
          role: "user",
          content: displayMessage || trimmedMessage,
          createdAt,
          sources: [],
          missingFields: [],
          resultCard: null,
        }
      : null;

    set((state) => ({
      messages: userMessage ? [...state.messages, userMessage] : state.messages,
      isSending: true,
      error: null,
      pendingMissingFields: hasFieldValues ? null : state.pendingMissingFields,
      progressiveMessageId: null,
    }));

    const retryableMessage = {
      message: trimmedMessage,
      language,
      fieldValues,
      displayMessage,
    };

    try {
      const assistantMessage = await sendAssistantMessage({
        conversationId: activeConversationId,
        message: trimmedMessage,
        language,
        fieldValues: finalFieldValues,
      });

      const nextConversationId =
        assistantMessage.conversationId || activeConversationId;
      const assistantWithConversation = {
        ...assistantMessage,
        conversationId: nextConversationId,
      };

      set((state) => {
        const messagesWithConversation = state.messages.map((item) =>
          item.conversationId || !nextConversationId
            ? item
            : { ...item, conversationId: nextConversationId },
        );
        const nextMessages = [
          ...messagesWithConversation,
          assistantWithConversation,
        ];

        return {
          messages: nextMessages,
          activeConversationId: nextConversationId,
          isSending: false,
          retryableMessage: null,
          pendingMissingFields: assistantWithConversation.missingFields?.length
            ? {
                messageId: assistantWithConversation.id,
                fields: assistantWithConversation.missingFields,
              }
            : null,
          progressiveMessageId: assistantWithConversation.id,
          conversations: upsertConversation(state.conversations, {
            id: nextConversationId,
            title: deriveConversationTitle(nextMessages, userMessage?.content),
            lastMessage: assistantWithConversation.content,
            updatedAt: assistantWithConversation.createdAt,
          }),
        };
      });

      return assistantWithConversation;
    } catch (error) {
      set({
        error: normalizeAssistantError(error),
        isSending: false,
        retryableMessage,
      });
      return null;
    }
  },

  submitMissingFields: async ({ fieldValues, language, displayMessage }) => {
    const activeConversationId = get().activeConversationId;
    if (!activeConversationId) return null;

    // Send a clean continuation message with structured field_values.
    // The AI service will extract and merge these values into the pending operation.
    // DO NOT send a text-based "Field is value" message as it can cause extraction failures.
    return get().sendMessage({
      message: "Continue with the provided information",
      language,
      fieldValues,
      displayMessage,
    });
  },

  retryLastMessage: async () => {
    const retryableMessage = get().retryableMessage;
    if (!retryableMessage) return null;

    return get().sendMessage({
      ...retryableMessage,
      appendUserMessage: false,
    });
  },

  clearError: () => set({ error: null }),
  markProgressiveComplete: (messageId) => {
    if (get().progressiveMessageId === messageId) {
      set({ progressiveMessageId: null });
    }
  },
}));
