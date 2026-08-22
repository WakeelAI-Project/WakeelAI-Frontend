// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../i18n";
import { DocumentPreview } from "./document-preview";

describe("DocumentPreview", () => {
  it("renders draft document text as Markdown and defaults to LTR for English", () => {
    const { container } = render(
      <DocumentPreview
        title="Employment Contract"
        content={"### Company Information\n\n**Company:** Wakeel AI\n\n- First clause"}
        showCitationFooter={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Company Information" })).toBeInTheDocument();
    expect(screen.getByText("Company:").tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText("First clause").closest("ul")).toBeInTheDocument();
    const bodyContainer = container.querySelector("[dir]");
    expect(bodyContainer).toHaveAttribute("dir", "ltr");
  });

  it("applies RTL direction to pure Arabic content", () => {
    const arabicText = "عقد عمل فردي وفقا لقانون العمل المصري رقم 12 لسنة 2003 بين الشركة والموظف.";
    const { container } = render(
      <DocumentPreview
        title="عقد عمل"
        content={arabicText}
        showCitationFooter={false}
      />,
    );

    const bodyContainer = container.querySelector("[dir]");
    expect(bodyContainer).toHaveAttribute("dir", "rtl");
    expect(screen.getByText(arabicText)).toBeInTheDocument();
  });

  it("retains LTR for predominantly English content with an isolated Arabic name", () => {
    const predominantlyEnglish = "This Employment Contract is executed between Wakeel AI and employee John (جون).";
    const { container } = render(
      <DocumentPreview
        title="Employment Agreement"
        content={predominantlyEnglish}
        showCitationFooter={false}
      />,
    );

    const bodyContainer = container.querySelector("[dir]");
    expect(bodyContainer).toHaveAttribute("dir", "ltr");
  });

  it("applies RTL for predominantly Arabic content with an English company name", () => {
    const predominantlyArabic = "تم إبرام هذا العقد في جمهورية مصر العربية لصالح شركة Wakeel AI المحدودة.";
    const { container } = render(
      <DocumentPreview
        title="عقد توظيف"
        content={predominantlyArabic}
        showCitationFooter={false}
      />,
    );

    const bodyContainer = container.querySelector("[dir]");
    expect(bodyContainer).toHaveAttribute("dir", "rtl");
  });

  it("renders empty or null content safely without crashing", () => {
    const { container } = render(
      <DocumentPreview
        title="Empty Contract"
        content={null}
        showCitationFooter={false}
      />,
    );

    const bodyContainer = container.querySelector("[dir]");
    expect(bodyContainer).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("No content available")).toBeInTheDocument();
  });
});
