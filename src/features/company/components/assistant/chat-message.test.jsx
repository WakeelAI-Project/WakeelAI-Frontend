// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../../../i18n";
import { ChatMessage } from "./chat-message";

describe("ChatMessage", () => {
  it("uses RTL direction for Arabic assistant Markdown", () => {
    render(
      <ChatMessage
        message={{
          id: "assistant-1",
          role: "assistant",
          content: "## الإجازة السنوية\n\n- يستحق العامل إجازة مدفوعة.",
          sources: [],
          missingFields: [],
          resultCard: null,
        }}
      />
    );

    const heading = screen.getByRole("heading", { name: "الإجازة السنوية" });
    expect(heading.closest("[dir='rtl']")).toBeInTheDocument();
  });
});
