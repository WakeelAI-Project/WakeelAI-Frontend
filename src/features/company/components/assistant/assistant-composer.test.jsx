// @vitest-environment jsdom

import React, { useState } from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../../../i18n";
import i18n from "../../../../i18n";
import { AssistantComposer } from "./assistant-composer";

function renderComposer({
  initialValue = "",
  initialSelection = null,
  onSubmit = vi.fn(),
  onSelectCommand = vi.fn(),
  onClearCommand = vi.fn(),
} = {}) {
  function Harness() {
    const [value, setValue] = useState(initialValue);
    const [selection, setSelection] = useState(initialSelection);

    return (
      <AssistantComposer
        value={value}
        onChange={setValue}
        onSubmit={onSubmit}
        isSending={false}
        selectedCommand={selection}
        onSelectCommand={(nextSelection) => {
          setSelection(nextSelection);
          onSelectCommand(nextSelection);
        }}
        onClearCommand={() => {
          setSelection(null);
          onClearCommand();
        }}
      />
    );
  }

  return {
    ...render(<Harness />),
    onSubmit,
    onSelectCommand,
    onClearCommand,
  };
}

function typeMessage(textarea, value) {
  fireEvent.change(textarea, {
    target: {
      value,
      selectionStart: value.length,
    },
  });
}

describe("AssistantComposer slash commands", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    document.documentElement.dir = "ltr";
  });

  afterEach(() => {
    cleanup();
  });

  it("opens the slash command menu when typing /", () => {
    renderComposer();

    typeMessage(screen.getByRole("textbox", { name: /message wakeel ai/i }), "/");

    expect(screen.getByTestId("slash-command-menu")).toBeInTheDocument();
    expect(screen.getByText("Employee Context")).toBeInTheDocument();
    expect(screen.getByText("Document Generate")).toBeInTheDocument();
  });

  it("filters commands as the user continues typing", () => {
    renderComposer();

    typeMessage(screen.getByRole("textbox", { name: /message wakeel ai/i }), "/emp");

    expect(screen.getByText("Employee Context")).toBeInTheDocument();
    expect(screen.queryByText("Company Context")).not.toBeInTheDocument();
    expect(screen.queryByText("Document Generate")).not.toBeInTheDocument();
  });

  it("supports arrow-key navigation and Enter selection", () => {
    const { onSelectCommand } = renderComposer();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "/");
    fireEvent.keyDown(textbox, { key: "ArrowDown" });
    fireEvent.keyDown(textbox, { key: "Enter" });

    expect(onSelectCommand).toHaveBeenCalledWith({ commandId: "company-context" });
    expect(screen.getByTestId("slash-command-chip")).toHaveTextContent("Company Context");
  });

  it("selects Employee Context and shows a removable command chip", () => {
    const { onClearCommand, onSelectCommand } = renderComposer();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "/emp");
    fireEvent.click(screen.getByRole("option", { name: /employee context/i }));

    expect(onSelectCommand).toHaveBeenCalledWith({ commandId: "employee-context" });
    expect(screen.getByTestId("slash-command-chip")).toHaveTextContent("Employee Context");

    fireEvent.click(screen.getByRole("button", { name: /remove selected command/i }));

    expect(onClearCommand).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("slash-command-chip")).not.toBeInTheDocument();
  });

  it("maps Company Policy, Labor Law, and Calculation selections from the menu", () => {
    const { onSelectCommand } = renderComposer();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "/policy");
    fireEvent.click(screen.getByRole("option", { name: /company policy/i }));

    expect(onSelectCommand).toHaveBeenLastCalledWith({ commandId: "company-policy" });

    fireEvent.click(screen.getByRole("button", { name: /remove selected command/i }));
    typeMessage(textbox, "/labor");
    fireEvent.click(screen.getByRole("option", { name: /labor law/i }));

    expect(onSelectCommand).toHaveBeenLastCalledWith({ commandId: "labor-law" });

    fireEvent.click(screen.getByRole("button", { name: /remove selected command/i }));
    typeMessage(textbox, "/calc");
    fireEvent.click(screen.getByRole("option", { name: /calculation/i }));

    expect(onSelectCommand).toHaveBeenLastCalledWith({ commandId: "calculation" });
  });

  it("opens the document type picker and selects each supported document type", () => {
    const { onSelectCommand } = renderComposer();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "/doc");
    fireEvent.click(screen.getByRole("option", { name: /document generate/i }));

    const menu = screen.getByTestId("slash-command-menu");
    expect(within(menu).getByRole("option", { name: /^contract$/i })).toBeInTheDocument();
    expect(within(menu).getByRole("option", { name: /warning letter/i })).toBeInTheDocument();
    expect(within(menu).getByRole("option", { name: /termination letter/i })).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole("option", { name: /^contract$/i }));
    expect(onSelectCommand).toHaveBeenLastCalledWith({
      commandId: "document-generate",
      documentTypeId: "contract",
    });

    fireEvent.click(screen.getByRole("button", { name: /remove selected command/i }));
    typeMessage(textbox, "/doc");
    fireEvent.click(screen.getByRole("option", { name: /document generate/i }));
    fireEvent.click(screen.getByRole("option", { name: /warning letter/i }));
    expect(onSelectCommand).toHaveBeenLastCalledWith({
      commandId: "document-generate",
      documentTypeId: "warning-letter",
    });

    fireEvent.click(screen.getByRole("button", { name: /remove selected command/i }));
    typeMessage(textbox, "/doc");
    fireEvent.click(screen.getByRole("option", { name: /document generate/i }));
    fireEvent.click(screen.getByRole("option", { name: /termination letter/i }));
    expect(onSelectCommand).toHaveBeenLastCalledWith({
      commandId: "document-generate",
      documentTypeId: "termination-letter",
    });
  });

  it("closes on Escape and does not open for normal slash characters", () => {
    renderComposer();
    const textbox = screen.getByRole("textbox", { name: /message wakeel ai/i });

    typeMessage(textbox, "/");
    fireEvent.keyDown(textbox, { key: "Escape" });
    expect(screen.queryByTestId("slash-command-menu")).not.toBeInTheDocument();

    typeMessage(textbox, "https://wakeel.ai/");
    expect(screen.queryByTestId("slash-command-menu")).not.toBeInTheDocument();
  });

  it("renders localized Arabic labels and RTL menu direction", async () => {
    await i18n.changeLanguage("ar");
    document.documentElement.dir = "rtl";
    renderComposer();

    typeMessage(screen.getByRole("textbox"), "/");

    expect(screen.getByTestId("slash-command-menu")).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("سياق الموظف")).toBeInTheDocument();
    expect(screen.getByText("قانون العمل")).toBeInTheDocument();
  });

  it("uses an absolutely positioned picker so it does not resize the input area", () => {
    renderComposer();

    typeMessage(screen.getByRole("textbox", { name: /message wakeel ai/i }), "/");

    expect(screen.getByTestId("slash-command-menu")).toHaveClass(
      "absolute",
      "bottom-full",
      "max-h-80",
      "overflow-y-auto",
    );
  });
});
