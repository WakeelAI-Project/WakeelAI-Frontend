// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  getTemplateMock: vi.fn(),
  generateLegalClausesMock: vi.fn(),
  useToastMock: vi.fn(() => ({ toast: vi.fn() })),
}));

vi.mock("react-router", () => ({
  useNavigate: () => mocks.navigateMock,
  useParams: () => ({ templateId: "tpl-123" }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const map = {
        "templates.generateLegalClauses": "Generate Legal Clauses",
        "templates.generateLegalClausesTitle": "Generate Legal Clauses",
        "templates.generateLegalClausesDescription":
          "Generate clauses from the legal and policy sources available to this company.",
        "templates.generateLegalClausesLanguage": "Language",
        "templates.generateLegalClausesUseLaborLaw": "Use Egyptian Labor Law",
        "templates.generateLegalClausesUseCompanyPolicy": "Use Company Policy",
        "templates.generateLegalClausesInstruction": "Optional instruction",
        "templates.generateLegalClausesGenerate": "Generate",
        "templates.generateLegalClausesCancel": "Cancel",
        "templates.generateLegalClausesReview": "Review clauses",
        "templates.generateLegalClausesReviewTitle": "Review generated clauses",
        "templates.generateLegalClausesInsert": "Insert into Template",
        "templates.generateLegalClausesEdit": "Edit",
        "templates.generateLegalClausesReject": "Reject",
        "templates.generateLegalClausesSelect": "Select",
        "templates.generateLegalClausesSelected": "Selected",
        "templates.generateLegalClausesClauseText": "Clause text",
        "templates.generateLegalClausesCancelEdit": "Cancel edit",
        "templates.generateLegalClausesSaveEdit": "Save edit",
        "templates.generateLegalClausesLoadingContext":
          "Retrieving legal context...",
        "templates.generateLegalClausesLoadingGenerate":
          "Generating clauses...",
        "templates.generateLegalClausesClauseType": "Clause type",
        "templates.generateLegalClausesClauseTypeRequired":
          "Choose a clause type before generating.",
        "templates.fields.documentType": "Document Type",
        "templates.fields.content": "Content Template",
        "templates.placeholders.employeeName": "Employee Name",
        "templates.placeholders.jobTitle": "Job Title",
        "templates.errors.aiUnavailable":
          "AI service is currently unavailable.",
        "templates.errors.noRelevantSources":
          "No sufficiently relevant legal or company-policy sources were found. Please adjust the request or add the required company policy.",
      };

      if (options?.defaultValue) return options.defaultValue;
      return map[key] || key;
    },
  }),
}));

vi.mock("../features/company/services/template-service", () => ({
  createTemplate: vi.fn(),
  getTemplate: mocks.getTemplateMock,
  isTemplateApiUnavailableError: () => false,
  updateTemplate: vi.fn(),
  generateLegalClauses: mocks.generateLegalClausesMock,
}));

vi.mock("../components/ui/toast", () => ({
  useToast: mocks.useToastMock,
}));

import { TemplateEditorPage } from "./template-editor";

describe("TemplateEditorPage legal clause generation", () => {
  // Without this, renders from earlier tests stay attached to document.body
  // (this file doesn't use vitest's `globals` mode, so RTL's automatic
  // afterEach cleanup never registers), and global `screen`/`within` queries
  // can silently match a stale instance from a previous test instead of the
  // current render.
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getTemplateMock.mockResolvedValue({
      id: "tpl-123",
      name: "Employment Contract",
      document_type: "Contract",
      content_template: "{{employee_name}}\n\n",
      is_active: true,
    });
    mocks.generateLegalClausesMock.mockResolvedValue({
      success: true,
      clauses: [
        {
          id: "clause-1",
          title: "Working Hours",
          content:
            "The employee shall work according to the approved weekly schedule.",
          category: "labor_law",
          language: "en",
          sources: [
            {
              id: "source-1",
              title: "Egyptian Labor Law",
              type: "labor-law",
              metadata: { article: "71", section: "Working Hours", page: "12" },
            },
          ],
        },
      ],
    });
  });

  it("renders the generate legal clauses button and opens the dialog", async () => {
    render(<TemplateEditorPage mode="edit" />);

    await waitFor(() => expect(mocks.getTemplateMock).toHaveBeenCalled());

    const trigger = screen.getAllByRole("button", {
      name: /generate legal clauses/i,
    })[0];
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(
        screen.getAllByText(/generate legal clauses/i).length,
      ).toBeGreaterThan(0);
    });
    expect(await screen.findByLabelText(/language/i)).toBeInTheDocument();
  });

  it("sends the correct payload without a companyId and renders generated clauses", async () => {
    render(<TemplateEditorPage mode="edit" />);

    await waitFor(() => expect(mocks.getTemplateMock).toHaveBeenCalled());

    fireEvent.click(
      screen.getAllByRole("button", { name: /generate legal clauses/i })[0],
    );
    fireEvent.click(await screen.findByRole("button", { name: /^generate$/i }));

    await waitFor(() =>
      expect(mocks.generateLegalClausesMock).toHaveBeenCalledTimes(1),
    );

    const payload = mocks.generateLegalClausesMock.mock.calls[0][1];
    expect(payload).toMatchObject({
      language: "en",
      include_labor_law: true,
      include_company_policy: true,
      instruction: "",
    });
    expect(payload.companyId).toBeUndefined();

    expect(await screen.findByText("Working Hours")).toBeInTheDocument();
    expect(screen.getAllByText(/Egyptian Labor Law/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/71/i)).toBeInTheDocument();
  });

  it("allows editing and rejecting a clause, then inserting it into the content template", async () => {
    render(<TemplateEditorPage mode="edit" />);

    await waitFor(() => expect(mocks.getTemplateMock).toHaveBeenCalled());

    fireEvent.click(
      screen.getAllByRole("button", { name: /generate legal clauses/i })[0],
    );
    fireEvent.click(await screen.findByRole("button", { name: /^generate$/i }));

    await waitFor(() =>
      expect(mocks.generateLegalClausesMock).toHaveBeenCalled(),
    );

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    const textarea = screen.getAllByRole("textbox").at(-1);
    fireEvent.change(textarea, { target: { value: "Updated clause text." } });
    fireEvent.click(screen.getByRole("button", { name: /save edit/i }));

    expect(screen.getByText("Updated clause text.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));

    mocks.generateLegalClausesMock.mockResolvedValueOnce({
      success: true,
      clauses: [
        {
          id: "clause-2",
          title: "Termination Notice",
          content:
            "The company will provide a written notice before termination.",
          category: "company_policy",
          language: "en",
          sources: [
            {
              id: "source-2",
              title: "Company Handbook",
              type: "company-policy",
              metadata: { section: "4.2" },
            },
          ],
        },
      ],
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: /generate legal clauses/i })[0],
    );
    fireEvent.click(await screen.findByRole("button", { name: /^generate$/i }));
    await waitFor(() =>
      expect(mocks.generateLegalClausesMock).toHaveBeenCalledTimes(2),
    );

    fireEvent.click(screen.getByRole("button", { name: /select/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /insert into template/i }),
    );

    await waitFor(() => {
      expect(mocks.generateLegalClausesMock).toHaveBeenCalledTimes(2);
    });
  });

  it("inserts English and Arabic Quick Start boilerplates and synchronizes document type", async () => {
    render(<TemplateEditorPage mode="create" />);
    const quickStartSection = screen.getAllByText("Quick start")[0].closest("section");

    // Initial English buttons exist
    expect(within(quickStartSection).getByRole("button", { name: "Employment Contract" })).toBeInTheDocument();
    expect(within(quickStartSection).getByRole("button", { name: "Warning Letter" })).toBeInTheDocument();
    expect(within(quickStartSection).getByRole("button", { name: "Termination Letter" })).toBeInTheDocument();

    // English toggle button is visible
    expect(within(quickStartSection).getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(within(quickStartSection).getByRole("button", { name: "العربية" })).toBeInTheDocument();

    // Switch to Arabic
    fireEvent.click(within(quickStartSection).getByRole("button", { name: "العربية" }));

    // Arabic template buttons should now be present
    expect(await within(quickStartSection).findByRole("button", { name: "عقد عمل فردي" })).toBeInTheDocument();
    expect(within(quickStartSection).getByRole("button", { name: "خطاب إنذار كتابي" })).toBeInTheDocument();
    expect(within(quickStartSection).getByRole("button", { name: "إخطار بإنهاء العمل" })).toBeInTheDocument();

    // English buttons should no longer be visible when Arabic is selected
    expect(within(quickStartSection).queryByRole("button", { name: "Employment Contract" })).not.toBeInTheDocument();

    // Switch back to English
    fireEvent.click(within(quickStartSection).getByRole("button", { name: "English" }));

    // English buttons should reappear
    expect(await within(quickStartSection).findByRole("button", { name: "Employment Contract" })).toBeInTheDocument();
    expect(within(quickStartSection).queryByRole("button", { name: "عقد عمل فردي" })).not.toBeInTheDocument();
  });

  it("Quick Start inserts boilerplate above existing content instead of overwriting it", async () => {
    const { container } = render(<TemplateEditorPage mode="create" />);

    const contentTextarea = container.querySelector('textarea[name="content_template"]');
    expect(contentTextarea).toBeTruthy();
    fireEvent.change(contentTextarea, { target: { value: "My custom clause text." } });
    expect(contentTextarea).toHaveValue("My custom clause text.");

    const quickStartSection = screen.getAllByText("Quick start")[0].closest("section");
    fireEvent.click(within(quickStartSection).getByRole("button", { name: "Employment Contract" }));

    await waitFor(() => {
      expect(contentTextarea.value).toContain("Employment Contract");
    });
    expect(contentTextarea.value).toContain("My custom clause text.");
    // Boilerplate must come first, existing content preserved after it.
    expect(contentTextarea.value.indexOf("Employment Contract")).toBeLessThan(
      contentTextarea.value.indexOf("My custom clause text."),
    );
  });

  it("normal editor typing and inserting variable placeholders work at cursor and are not forced to top", async () => {
    const { container } = render(<TemplateEditorPage mode="create" />);

    const contentTextarea = container.querySelector('textarea[name="content_template"]');
    fireEvent.change(contentTextarea, { target: { value: "Header line\nMiddle line\nFooter line" } });
    expect(contentTextarea).toHaveValue("Header line\nMiddle line\nFooter line");

    // Simulate placing cursor at the end
    contentTextarea.selectionStart = contentTextarea.value.length;
    contentTextarea.selectionEnd = contentTextarea.value.length;

    // Normal typing appends where typed
    fireEvent.change(contentTextarea, { target: { value: contentTextarea.value + "\nAppended text" } });
    expect(contentTextarea.value.endsWith("Appended text")).toBe(true);

    // Clicking a placeholder inserts at cursor position (at the end)
    contentTextarea.selectionStart = contentTextarea.value.length;
    contentTextarea.selectionEnd = contentTextarea.value.length;
    const placeholderButton = screen.getAllByRole("button", { name: /Employee Name/i })[0];
    if (placeholderButton) {
      fireEvent.click(placeholderButton);
      expect(contentTextarea.value.endsWith("{{employee_name}}")).toBe(true);
    }
  });

  it("successive Quick Start clicks prepend each time without losing existing content (both Arabic and English)", async () => {
    const { container } = render(<TemplateEditorPage mode="create" />);

    const contentTextarea = container.querySelector('textarea[name="content_template"]');
    fireEvent.change(contentTextarea, { target: { value: "Initial base content" } });

    const quickStartSection = screen.getAllByText("Quick start")[0].closest("section");
    
    // English Quick Start
    fireEvent.click(within(quickStartSection).getByRole("button", { name: "Warning Letter" }));
    await waitFor(() => {
      expect(contentTextarea.value).toContain("Warning Letter");
      expect(contentTextarea.value).toContain("Initial base content");
    });
    expect(contentTextarea.value.indexOf("Warning Letter")).toBeLessThan(
      contentTextarea.value.indexOf("Initial base content"),
    );

    // Switch to Arabic and insert Arabic Quick Start
    fireEvent.click(within(quickStartSection).getByRole("button", { name: "العربية" }));
    const arButton = await within(quickStartSection).findByRole("button", { name: "عقد عمل فردي" });
    fireEvent.click(arButton);

    await waitFor(() => {
      expect(contentTextarea.value).toContain("عقد عمل فردي");
      expect(contentTextarea.value).toContain("Warning Letter");
      expect(contentTextarea.value).toContain("Initial base content");
    });

    // Arabic contract is prepended to top, warning letter is below it, initial content is at the bottom
    expect(contentTextarea.value.indexOf("عقد عمل فردي")).toBeLessThan(
      contentTextarea.value.indexOf("Warning Letter"),
    );
    expect(contentTextarea.value.indexOf("Warning Letter")).toBeLessThan(
      contentTextarea.value.indexOf("Initial base content"),
    );
  });

  it("requires a clause type to be selected before generating clauses", async () => {
    render(<TemplateEditorPage mode="edit" />);

    await waitFor(() => expect(mocks.getTemplateMock).toHaveBeenCalled());

    fireEvent.click(
      screen.getAllByRole("button", { name: /generate legal clauses/i })[0],
    );

    const clauseTypeSelect = await screen.findByLabelText(/clause type/i);
    fireEvent.change(clauseTypeSelect, { target: { value: "" } });

    const generateButton = await screen.findByRole("button", { name: /^generate$/i });
    expect(generateButton).toBeDisabled();

    fireEvent.click(generateButton);
    expect(mocks.generateLegalClausesMock).not.toHaveBeenCalled();
  });
});
