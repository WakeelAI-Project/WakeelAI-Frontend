// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownRenderer, safeMarkdownUrl } from "./markdown-renderer";

describe("MarkdownRenderer", () => {
  it("renders common Markdown and GFM tables inside chat-safe markup", () => {
    const markdown = `# Annual Leave

**Bold** and *italic* text.

- First
- Second

1. One
2. Two

> Important note

\`inline code\`

\`\`\`js
console.log("hello");
\`\`\`

| Item | Rule |
| --- | --- |
| Minimum | 21 days |

---

[Labor law](https://example.com/law)`;

    const { container } = render(<MarkdownRenderer text={markdown} />);

    expect(screen.getByRole("heading", { name: "Annual Leave" })).toBeInTheDocument();
    expect(screen.getByText("Bold").tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText("italic").tagName.toLowerCase()).toBe("em");
    expect(screen.getByText("First").closest("ul")).toBeInTheDocument();
    expect(screen.getByText("One").closest("ol")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toHaveTextContent("Important note");
    expect(container.querySelector("code")).toHaveTextContent("inline code");
    expect(container.querySelector("pre code")).toHaveTextContent("console.log");
    expect(within(screen.getByRole("table")).getByText("21 days")).toBeInTheDocument();
    expect(container.querySelector("hr")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Labor law" })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders Arabic Markdown content", () => {
    render(<MarkdownRenderer text={"## الإجازة السنوية\n\n- يستحق العامل إجازة مدفوعة."} />);

    expect(screen.getByRole("heading", { name: "الإجازة السنوية" })).toBeInTheDocument();
    expect(screen.getByText("يستحق العامل إجازة مدفوعة.")).toBeInTheDocument();
  });

  it("drops raw HTML and unsafe links from AI output", () => {
    const { container } = render(
      <MarkdownRenderer text={'<script>alert("xss")</script>\n\n[bad](javascript:alert(1))'} />
    );

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByText("bad").closest("a")).toBeNull();
    expect(safeMarkdownUrl("javascript:alert(1)")).toBe("");
  });
});
