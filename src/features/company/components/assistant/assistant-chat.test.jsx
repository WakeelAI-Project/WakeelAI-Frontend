// @vitest-environment jsdom

import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../../../i18n";
import i18n from "../../../../i18n";

const assistantStoreMock = vi.hoisted(() => ({
  state: null,
}));

vi.mock("../../store/assistant-store", () => ({
  useAssistantStore: () => assistantStoreMock.state,
}));

import { AssistantChat } from "./assistant-chat";

function assistantMessage(conversationId = "conv-1") {
  return {
    id: "assistant-1",
    conversationId,
    role: "assistant",
    content: "Answer",
    createdAt: "2030-01-01T00:00:00Z",
    sources: [],
    missingFields: [],
    resultCard: null,
  };
}

function createStore(overrides = {}) {
  return {
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoadingHistory: false,
    isLoadingConversations: false,
    isSending: false,
    error: null,
    retryableMessage: null,
    progressiveMessageId: null,
    conversationListStatus: "ready",
    loadConversations: vi.fn(),
    startNewConversation: vi.fn(),
    selectConversation: vi.fn(),
    sendMessage: vi.fn().mockResolvedValue(assistantMessage()),
    submitMissingFields: vi.fn(),
    retryLastMessage: vi.fn(),
    markProgressiveComplete: vi.fn(),
    deleteConversation: vi.fn(),
    targetContext: null,
    setTargetContext: vi.fn(),
    ...overrides,
  };
}

function renderAssistantChat() {
  return render(
    <MemoryRouter>
      <AssistantChat />
    </MemoryRouter>,
  );
}

function typeMessage(textarea, value) {
  fireEvent.change(textarea, {
    target: {
      value,
      selectionStart: value.length,
    },
  });
}

describe("AssistantChat slash command request integration", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    document.documentElement.dir = "ltr";
    assistantStoreMock.state = createStore();
  });

  afterEach(() => {
    cleanup();
  });

  it("includes the selected Employee Context capability in the outgoing request", async () => {
    const sendMessage = vi.fn().mockResolvedValue(assistantMessage());
    assistantStoreMock.state = createStore({ sendMessage });
    renderAssistantChat();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "/emp");
    fireEvent.click(screen.getByRole("option", { name: /employee context/i }));
    typeMessage(textbox, "What do you know about Nourhan?");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({
        message: "What do you know about Nourhan?",
        language: "EN",
        fieldValues: {
          capability: "employee_context",
        },
      });
    });

    expect(screen.queryByTestId("slash-command-chip")).not.toBeInTheDocument();
    expect(textbox).toHaveValue("");
  });

  it("includes document generation capability and document_type in the outgoing request", async () => {
    const sendMessage = vi.fn().mockResolvedValue(assistantMessage());
    assistantStoreMock.state = createStore({ sendMessage });
    renderAssistantChat();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "/doc");
    fireEvent.click(screen.getByRole("option", { name: /document generate/i }));
    fireEvent.click(
      within(screen.getByTestId("slash-command-menu")).getByRole("option", {
        name: /^contract$/i,
      }),
    );
    typeMessage(textbox, "Create this for Nourhan");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({
        message: "Create this for Nourhan",
        language: "EN",
        fieldValues: {
          capability: "document_generation",
          document_type: "Contract",
        },
      });
    });
  });

  it("leaves normal chat payloads unchanged when no slash command is selected", async () => {
    const sendMessage = vi.fn().mockResolvedValue(assistantMessage());
    assistantStoreMock.state = createStore({ sendMessage });
    renderAssistantChat();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "Hello Wakeel");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({
        message: "Hello Wakeel",
        language: "EN",
      });
    });
  });
});
