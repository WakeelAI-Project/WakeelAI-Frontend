export const SLASH_COMMANDS = Object.freeze([
  {
    id: "employee-context",
    command: "/employee-context",
    capability: "employee_context",
    labelKey: "assistant.slashCommands.commands.employeeContext.label",
    descriptionKey: "assistant.slashCommands.commands.employeeContext.description",
  },
  {
    id: "company-context",
    command: "/company-context",
    capability: "company_context",
    labelKey: "assistant.slashCommands.commands.companyContext.label",
    descriptionKey: "assistant.slashCommands.commands.companyContext.description",
  },
  {
    id: "company-policy",
    command: "/company-policy",
    capability: "company_policy",
    labelKey: "assistant.slashCommands.commands.companyPolicy.label",
    descriptionKey: "assistant.slashCommands.commands.companyPolicy.description",
  },
  {
    id: "labor-law",
    command: "/labor-law",
    capability: "labor_law",
    labelKey: "assistant.slashCommands.commands.laborLaw.label",
    descriptionKey: "assistant.slashCommands.commands.laborLaw.description",
  },
  {
    id: "calculation",
    command: "/calculation",
    capability: "calculation",
    labelKey: "assistant.slashCommands.commands.calculation.label",
    descriptionKey: "assistant.slashCommands.commands.calculation.description",
  },
  {
    id: "document-generate",
    command: "/document-generate",
    capability: "document_generation",
    labelKey: "assistant.slashCommands.commands.documentGenerate.label",
    descriptionKey: "assistant.slashCommands.commands.documentGenerate.description",
  },
]);

export const SLASH_DOCUMENT_TYPES = Object.freeze([
  {
    id: "contract",
    documentType: "Contract",
    labelKey: "assistant.slashCommands.documentTypes.contract",
  },
  {
    id: "warning-letter",
    documentType: "Warning_Letter",
    labelKey: "assistant.slashCommands.documentTypes.warningLetter",
  },
  {
    id: "termination-letter",
    documentType: "Termination_Letter",
    labelKey: "assistant.slashCommands.documentTypes.terminationLetter",
  },
]);

export const DOCUMENT_GENERATE_COMMAND_ID = "document-generate";

export function getSlashCommandById(commandId) {
  return SLASH_COMMANDS.find((command) => command.id === commandId) || null;
}

export function getSlashDocumentTypeById(documentTypeId) {
  return SLASH_DOCUMENT_TYPES.find((documentType) => documentType.id === documentTypeId) || null;
}

export function getSlashCommandFieldValues(selection) {
  const command = getSlashCommandById(selection?.commandId);
  if (!command) return {};

  const fieldValues = {
    capability: command.capability,
  };

  if (command.id === DOCUMENT_GENERATE_COMMAND_ID) {
    const documentType = getSlashDocumentTypeById(selection?.documentTypeId);
    if (documentType) {
      fieldValues.document_type = documentType.documentType;
    }
  }

  return fieldValues;
}
