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

  it("keeps user messages right-aligned and assistant messages left-aligned regardless of app direction", () => {
    document.documentElement.dir = "rtl";

    try {
      const { container: userContainer } = render(
        <ChatMessage
          message={{ id: "user-1", role: "user", content: "مرحبا", sources: [], missingFields: [], resultCard: null }}
        />
      );
      expect(userContainer.querySelector("article")).toHaveClass("justify-end");
      expect(userContainer.querySelector("article")).toHaveAttribute("dir", "ltr");

      const { container: assistantContainer } = render(
        <ChatMessage
          message={{ id: "assistant-2", role: "assistant", content: "مرحبا", sources: [], missingFields: [], resultCard: null }}
        />
      );
      expect(assistantContainer.querySelector("article")).toHaveClass("justify-start");
      expect(assistantContainer.querySelector("article")).toHaveAttribute("dir", "ltr");
    } finally {
      document.documentElement.dir = "ltr";
    }
  });
});
