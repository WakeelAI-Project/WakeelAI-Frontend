// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../i18n";
import { DocumentPreview } from "./document-preview";

describe("DocumentPreview", () => {
  it("renders draft document text as Markdown", () => {
    render(
      <DocumentPreview
        title="Employment Contract"
        content={"### Company Information\n\n**Company:** Wakeel AI\n\n- First clause"}
        showCitationFooter={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Company Information" })).toBeInTheDocument();
    expect(screen.getByText("Company:").tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText("First clause").closest("ul")).toBeInTheDocument();
  });

  it("applies bidirectional document text handling to mixed Arabic and English content", () => {
    const mixedDirectionText = "\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629: Wakeel AI";
    const { container } = render(
      <DocumentPreview
        title="Employment Contract"
        content={`### Employment Contract\n\n${mixedDirectionText}`}
        showCitationFooter={false}
      />,
    );

    expect(container.querySelector(".document-draft-markdown")).toHaveClass("[&_*]:[unicode-bidi:plaintext]");
    expect(screen.getByText(mixedDirectionText)).toBeInTheDocument();
  });
});
