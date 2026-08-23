import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from "../../../lib/api";
import { getChatHistory, sendMessage, normalizeResultCard } from "./assistant-service";

describe("assistant-service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("omits conversation_id on the first message and normalizes the returned id", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        chat_id: "chat-1",
        conversation_id: "conv-1",
        reply: "Answer",
        created_at: "2030-01-01T00:00:00Z",
      },
    });

    const result = await sendMessage({
      conversationId: null,
      message: "What are the annual leave rules?",
      language: "EN",
    });

    expect(api.post).toHaveBeenCalledWith("/ai/chat", {
      message: "What are the annual leave rules?",
      language: "EN",
      field_values: {},
    });
    expect(api.post.mock.calls[0][1]).not.toHaveProperty("userId");
    expect(api.post.mock.calls[0][1]).not.toHaveProperty("companyId");
    expect(result.conversationId).toBe("conv-1");
  });

  it("sends the same conversation_id on subsequent messages", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        chat_id: "chat-2",
        conversation_id: "conv-1",
        reply: "Arabic summary",
        created_at: "2030-01-01T00:01:00Z",
      },
    });

    await sendMessage({
      conversationId: "conv-1",
      message: "summarize it and write the response in arabic",
      language: "AR",
    });

    expect(api.post).toHaveBeenCalledWith("/ai/chat", {
      message: "summarize it and write the response in arabic",
      language: "AR",
      conversation_id: "conv-1",
      field_values: {},
    });
  });

  it("loads existing conversation history by conversation_id", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        conversationId: "conv-1",
        messages: [
          {
            messageId: "message-1",
            role: "assistant",
            content: "Previous answer",
          },
        ],
      },
    });

    const result = await getChatHistory("conv-1");

    expect(api.get).toHaveBeenCalledWith("/ai/chat/history", {
      params: {
        conversation_id: "conv-1",
        page: 1,
        limit: 50,
      },
    });
    expect(result.messages[0]).toEqual(expect.objectContaining({
      conversationId: "conv-1",
      content: "Previous answer",
    }));
  });

  // FIX-05: the assistant can now ask for confirmation before an irreversible action
  // (e.g. submitting/cancelling a leave draft) or ask the user to disambiguate between
  // more than one matching draft.
  describe("normalizeResultCard", () => {
    it("normalizes a confirmation card", () => {
      const card = normalizeResultCard({
        type: "confirmation",
        message: "Submit your Annual leave from 2026-03-01 to 2026-03-03?",
        confirm_prompt: "yes",
        cancel_prompt: "no",
      });

      expect(card).toEqual({
        type: "confirmation",
        message: "Submit your Annual leave from 2026-03-01 to 2026-03-03?",
        confirmPrompt: "yes",
        cancelPrompt: "no",
      });
    });

    it("normalizes a needs_disambiguation card with its option list", () => {
      const card = normalizeResultCard({
        type: "needs_disambiguation",
        message: "Which draft did you mean?",
        options: [
          { request_id: "req-1", leave_type: "Annual", start_date: "2026-03-01", end_date: "2026-03-03" },
          { request_id: "req-2", leave_type: "Sick", start_date: "2026-04-01", end_date: "2026-04-02" },
        ],
      });

      expect(card.type).toBe("needs_disambiguation");
      expect(card.message).toBe("Which draft did you mean?");
      expect(card.options).toHaveLength(2);
      expect(card.options[0]).toEqual({
        requestId: "req-1",
        leaveType: "Annual",
        startDate: "2026-03-01",
        endDate: "2026-03-03",
        label: null,
      });
    });

    it("returns null for a falsy or typeless card", () => {
      expect(normalizeResultCard(null)).toBeNull();
      expect(normalizeResultCard({})).toBeNull();
    });
  });
});
