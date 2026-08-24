import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from "../../../lib/api";
import { getChatHistory, sendMessage } from "./assistant-service";

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
});
