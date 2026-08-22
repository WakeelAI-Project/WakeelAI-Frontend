import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  getChatHistory: vi.fn(),
  getConversations: vi.fn(),
  normalizeAssistantError: vi.fn((error) => error),
  sendMessage: vi.fn(),
}));

vi.mock("../services/assistant-service", () => ({
  CONVERSATION_LIST_STATUS: {
    READY: "ready",
    PENDING_BACKEND_CONTRACT: "pending_backend_contract",
  },
  getChatHistory: serviceMocks.getChatHistory,
  getConversations: serviceMocks.getConversations,
  normalizeAssistantError: serviceMocks.normalizeAssistantError,
  sendMessage: serviceMocks.sendMessage,
}));

import { useAssistantStore } from "./assistant-store";

const resetStore = () => {
  useAssistantStore.setState({
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
    conversationListStatus: "ready",
  });
};

const assistantMessage = (conversationId, content = "Answer") => ({
  id: `assistant-${conversationId}-${content}`,
  conversationId,
  role: "assistant",
  content,
  createdAt: "2030-01-01T00:00:00Z",
  sources: [],
  missingFields: [],
  resultCard: null,
});

describe("assistant-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it("stores the first returned conversation id and reuses it on the second message", async () => {
    serviceMocks.sendMessage
      .mockResolvedValueOnce(
        assistantMessage("conv-1", "Long annual leave answer"),
      )
      .mockResolvedValueOnce(assistantMessage("conv-1", "Arabic summary"));

    await useAssistantStore.getState().sendMessage({
      message: "What are the annual leave rules under Egyptian Labor Law?",
      language: "EN",
    });

    expect(serviceMocks.sendMessage).toHaveBeenNthCalledWith(1, {
      conversationId: null,
      message: "What are the annual leave rules under Egyptian Labor Law?",
      language: "EN",
      fieldValues: {},
    });
    expect(useAssistantStore.getState().activeConversationId).toBe("conv-1");
    expect(
      useAssistantStore
        .getState()
        .messages.every((message) => message.conversationId === "conv-1"),
    ).toBe(true);

    await useAssistantStore.getState().sendMessage({
      message: "summarize it and write the response in arabic",
      language: "AR",
    });

    expect(serviceMocks.sendMessage).toHaveBeenNthCalledWith(2, {
      conversationId: "conv-1",
      message: "summarize it and write the response in arabic",
      language: "AR",
      fieldValues: {},
    });
  });

  it("clears the active conversation when starting a new conversation", () => {
    useAssistantStore.setState({
      activeConversationId: "conv-1",
      messages: [assistantMessage("conv-1")],
      pendingMissingFields: { messageId: "assistant-1", fields: [] },
      progressiveMessageId: "assistant-1",
    });

    useAssistantStore.getState().startNewConversation();

    expect(useAssistantStore.getState().activeConversationId).toBeNull();
    expect(useAssistantStore.getState().messages).toEqual([]);
    expect(useAssistantStore.getState().pendingMissingFields).toBeNull();
    expect(useAssistantStore.getState().progressiveMessageId).toBeNull();
  });

  it("restores the selected conversation id and messages from history", async () => {
    serviceMocks.getChatHistory.mockResolvedValueOnce({
      conversationId: "conv-a",
      messages: [
        {
          id: "message-1",
          conversationId: "conv-a",
          role: "assistant",
          content: "Previous answer",
          createdAt: "2030-01-01T00:00:00Z",
          sources: [],
          missingFields: [],
          resultCard: null,
        },
      ],
      pagination: null,
    });

    await useAssistantStore.getState().selectConversation("conv-a");

    expect(serviceMocks.getChatHistory).toHaveBeenCalledWith("conv-a");
    expect(useAssistantStore.getState().activeConversationId).toBe("conv-a");
    expect(useAssistantStore.getState().messages).toHaveLength(1);
    expect(useAssistantStore.getState().messages[0].conversationId).toBe(
      "conv-a",
    );
  });

  it("loads conversations from backend successfully", async () => {
    serviceMocks.getConversations.mockResolvedValueOnce({
      conversations: [
        {
          id: "conv-1",
          title: "Conversation",
          lastMessage: "",
          createdAt: "2030-01-01T00:00:00Z",
          updatedAt: "2030-01-01T00:00:00Z",
        },
      ],
      status: "ready",
      pagination: { page: 1, limit: 50, total: 1, hasNextPage: false },
    });

    // Start loading
    const loadPromise = useAssistantStore.getState().loadConversations();

    // Should be loading immediately
    expect(useAssistantStore.getState().isLoadingConversations).toBe(true);

    await loadPromise;

    // Loading done, data populated
    expect(useAssistantStore.getState().isLoadingConversations).toBe(false);
    expect(useAssistantStore.getState().conversations).toHaveLength(1);
    expect(useAssistantStore.getState().conversations[0].id).toBe("conv-1");
    expect(useAssistantStore.getState().conversationListStatus).toBe("ready");
  });

  it("handles getConversations failure gracefully", async () => {
    serviceMocks.getConversations.mockRejectedValueOnce(
      new Error("Network Error"),
    );

    await useAssistantStore.getState().loadConversations();

    expect(useAssistantStore.getState().isLoadingConversations).toBe(false);
    expect(useAssistantStore.getState().error).toBeDefined();
    // Conversations remain unchanged (empty from reset)
    expect(useAssistantStore.getState().conversations).toHaveLength(0);
  });

  it("submits structured field_values with clean continuation message", async () => {
    useAssistantStore.setState({
      activeConversationId: "conv-1",
      pendingMissingFields: {
        messageId: "assistant-1",
        fields: [
          { name: "employee_name", label: "Employee Name" },
          { name: "job_title", label: "Job Title" },
        ],
      },
    });

    serviceMocks.sendMessage.mockResolvedValueOnce(
      assistantMessage("conv-1", "Thank you."),
    );

    await useAssistantStore.getState().submitMissingFields({
      fieldValues: {
        employee_name: "Ahmed",
        job_title: "Programmer",
      },
      language: "EN",
      displayMessage: "Provided the requested details",
    });

    // CRITICAL REGRESSION TEST: Must send structured field_values with clean message
    // NOT text-based "Field is value" message that could cause extraction failures
    expect(serviceMocks.sendMessage).toHaveBeenCalledWith({
      conversationId: "conv-1",
      message: "Continue with the provided information",
      language: "EN",
      fieldValues: {
        employee_name: "Ahmed",
        job_title: "Programmer",
      },
    });
  });

  it("submitMissingFields sends structured field_values even with empty fields", async () => {
    useAssistantStore.setState({
      activeConversationId: "conv-1",
      pendingMissingFields: {
        messageId: "assistant-1",
        fields: [
          { name: "employee_name", label: "Employee Name" },
        ],
      },
    });

    serviceMocks.sendMessage.mockResolvedValueOnce(
      assistantMessage("conv-1", "OK"),
    );

    await useAssistantStore.getState().submitMissingFields({
      fieldValues: {},
      language: "EN",
      displayMessage: "Continue",
    });

    expect(serviceMocks.sendMessage).toHaveBeenCalledWith({
      conversationId: "conv-1",
      message: "Continue with the provided information",
      language: "EN",
      fieldValues: {},
    });
  });
});
