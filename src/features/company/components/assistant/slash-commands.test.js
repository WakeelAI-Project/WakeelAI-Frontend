import { describe, expect, it } from "vitest";
import { getSlashCommandFieldValues } from "./slash-commands";

describe("slash command request mapping", () => {
  it.each([
    ["employee-context", { capability: "employee_context" }],
    ["company-context", { capability: "company_context" }],
    ["company-policy", { capability: "company_policy" }],
    ["labor-law", { capability: "labor_law" }],
    ["calculation", { capability: "calculation" }],
  ])("maps %s to structured field_values", (commandId, expected) => {
    expect(getSlashCommandFieldValues({ commandId })).toEqual(expected);
  });

  it.each([
    ["contract", "Contract"],
    ["warning-letter", "Warning_Letter"],
    ["termination-letter", "Termination_Letter"],
  ])("maps document type %s to the existing document_type value", (documentTypeId, documentType) => {
    expect(
      getSlashCommandFieldValues({
        commandId: "document-generate",
        documentTypeId,
      }),
    ).toEqual({
      capability: "document_generation",
      document_type: documentType,
    });
  });

  it("ignores unknown selections", () => {
    expect(getSlashCommandFieldValues({ commandId: "unknown" })).toEqual({});
  });
});
