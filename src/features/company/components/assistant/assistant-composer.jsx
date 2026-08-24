import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Calculator,
  FileText,
  FileWarning,
  FileX2,
  Landmark,
  Scale,
  SendHorizontal,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/input";
import { cn } from "../../../../lib/utils";
import {
  DOCUMENT_GENERATE_COMMAND_ID,
  SLASH_COMMANDS,
  SLASH_DOCUMENT_TYPES,
  getSlashCommandById,
  getSlashDocumentTypeById,
} from "./slash-commands";

const COMMAND_ICONS = {
  "employee-context": UserRound,
  "company-context": Building2,
  "company-policy": ShieldCheck,
  "labor-law": Scale,
  calculation: Calculator,
  "document-generate": FileText,
};

const DOCUMENT_TYPE_ICONS = {
  contract: FileText,
  "warning-letter": FileWarning,
  "termination-letter": FileX2,
};

const emptySlashState = {
  open: false,
  mode: "commands",
  query: "",
  range: null,
  activeIndex: 0,
};

function getSlashTrigger(text, caretIndex) {
  const beforeCaret = text.slice(0, caretIndex);
  const match = beforeCaret.match(/(^|\s)\/([^\s/]*)$/u);

  if (!match) return null;

  const query = match[2] || "";
  const start = beforeCaret.length - query.length - 1;
  const previousCharacter = start > 0 ? beforeCaret[start - 1] : "";

  if (previousCharacter && !/\s/u.test(previousCharacter)) {
    return null;
  }

  return {
    start,
    end: caretIndex,
    query,
  };
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function commandMatchesQuery(command, query, t) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;

  const haystack = [
    command.command,
    command.capability,
    t(command.labelKey),
    t(command.descriptionKey),
  ]
    .map(normalizeSearch)
    .join(" ");

  return haystack.includes(normalizedQuery);
}

function SlashCommandRow({
  id,
  icon: Icon,
  title,
  description,
  isActive,
  onSelect,
}) {
  return (
    <button
      id={id}
      role="option"
      aria-selected={isActive}
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={cn(
        "flex min-h-14 w-full min-w-0 items-center gap-3 rounded-md px-3 py-2 text-start transition-colors",
        isActive
          ? "bg-(--ai-surface) text-(--ai-primary)"
          : "text-(--text-primary) hover:bg-(--bg-card-raised)",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-card)">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        {description && (
          <span className="mt-0.5 block truncate text-xs text-(--text-secondary)">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

function SelectedCommandChip({ selection, onClear }) {
  const { t } = useTranslation();
  const command = getSlashCommandById(selection?.commandId);

  if (!command) return null;

  const documentType = getSlashDocumentTypeById(selection?.documentTypeId);
  const Icon = COMMAND_ICONS[command.id] || Landmark;
  const label = documentType
    ? `${t(command.labelKey)}: ${t(documentType.labelKey)}`
    : t(command.labelKey);

  return (
    <div
      data-testid="slash-command-chip"
      className="mb-2 flex min-w-0 flex-wrap items-center gap-2"
    >
      <span className="inline-flex max-w-full items-center gap-2 rounded-md border border-(--ai-primary) bg-(--ai-surface) px-2.5 py-1 text-xs font-semibold text-(--ai-primary)">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
        <button
          type="button"
          className="-me-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm hover:bg-(--bg-card-raised)"
          aria-label={t("assistant.slashCommands.clearSelection")}
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  );
}

export function AssistantComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  selectedCommand,
  onSelectCommand,
  onClearCommand,
}) {
  const { t, i18n } = useTranslation();
  const textareaRef = useRef(null);
  const rootRef = useRef(null);
  const [slashState, setSlashState] = useState(emptySlashState);
  const canSend = value.trim().length > 0 && !isSending;
  const filteredCommands = useMemo(
    () =>
      SLASH_COMMANDS.filter((command) =>
        commandMatchesQuery(command, slashState.query, t),
      ),
    [slashState.query, t],
  );
  const activeOptions = slashState.mode === "documents"
    ? SLASH_DOCUMENT_TYPES
    : filteredCommands;

  const closeSlashMenu = () => setSlashState(emptySlashState);

  useEffect(() => {
    if (!slashState.open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        closeSlashMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [slashState.open]);

  useEffect(() => {
    if (selectedCommand) {
      closeSlashMenu();
    }
  }, [selectedCommand]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    closeSlashMenu();
    onSubmit(value);
  };

  const focusTextareaAt = (caretIndex) => {
    const schedule = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
    schedule(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(caretIndex, caretIndex);
    });
  };

  const removeSlashTrigger = () => {
    if (!slashState.range) return;

    const nextValue = `${value.slice(0, slashState.range.start)}${value.slice(slashState.range.end)}`;
    onChange(nextValue);
    focusTextareaAt(slashState.range.start);
  };

  const selectCommand = (command) => {
    if (command.id === DOCUMENT_GENERATE_COMMAND_ID) {
      setSlashState((state) => ({
        ...state,
        mode: "documents",
        activeIndex: 0,
      }));
      return;
    }

    removeSlashTrigger();
    closeSlashMenu();
    onSelectCommand?.({ commandId: command.id });
  };

  const selectDocumentType = (documentType) => {
    removeSlashTrigger();
    closeSlashMenu();
    onSelectCommand?.({
      commandId: DOCUMENT_GENERATE_COMMAND_ID,
      documentTypeId: documentType.id,
    });
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    const caretIndex = event.target.selectionStart ?? nextValue.length;
    onChange(nextValue);

    if (selectedCommand) {
      closeSlashMenu();
      return;
    }

    const trigger = getSlashTrigger(nextValue, caretIndex);
    if (!trigger) {
      closeSlashMenu();
      return;
    }

    setSlashState({
      open: true,
      mode: "commands",
      query: trigger.query,
      range: trigger,
      activeIndex: 0,
    });
  };

  const updateActiveIndex = (delta) => {
    if (!activeOptions.length) return;
    setSlashState((state) => ({
      ...state,
      activeIndex:
        (state.activeIndex + delta + activeOptions.length) %
        activeOptions.length,
    }));
  };

  const handleKeyDown = (event) => {
    if (slashState.open) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSlashMenu();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        updateActiveIndex(1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        updateActiveIndex(-1);
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const activeOption = activeOptions[slashState.activeIndex];
        if (!activeOption) return;

        if (slashState.mode === "documents") {
          selectDocumentType(activeOption);
        } else {
          selectCommand(activeOption);
        }
        return;
      }
    }

    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (canSend) {
      closeSlashMenu();
      onSubmit(value);
    }
  };

  const renderSlashMenu = () => {
    if (!slashState.open) return null;

    const isDocumentMode = slashState.mode === "documents";
    const activeOption = activeOptions[slashState.activeIndex];

    return (
      <div
        data-testid="slash-command-menu"
        role="listbox"
        aria-label={t("assistant.slashCommands.menuLabel")}
        aria-activedescendant={activeOption ? `slash-option-${activeOption.id}` : undefined}
        dir={i18n.dir()}
        className="absolute inset-x-0 bottom-full z-30 mb-2 max-h-80 overflow-y-auto rounded-md border border-(--border-default) bg-(--bg-card) p-1 shadow-(--shadow-3)"
      >
        {isDocumentMode && (
          <div className="mb-1 flex items-center gap-2 border-b border-(--border-default) px-3 py-2 text-sm font-semibold text-(--text-primary)">
            <FileText className="h-4 w-4 text-(--ai-primary)" />
            <span>{t("assistant.slashCommands.commands.documentGenerate.label")}</span>
          </div>
        )}

        {activeOptions.length === 0 ? (
          <div className="px-3 py-3 text-sm text-(--text-secondary)">
            {t("assistant.slashCommands.noResults")}
          </div>
        ) : isDocumentMode ? (
          SLASH_DOCUMENT_TYPES.map((documentType, index) => {
            const Icon = DOCUMENT_TYPE_ICONS[documentType.id] || FileText;
            return (
              <SlashCommandRow
                key={documentType.id}
                id={`slash-option-${documentType.id}`}
                icon={Icon}
                title={t(documentType.labelKey)}
                isActive={index === slashState.activeIndex}
                onSelect={() => selectDocumentType(documentType)}
              />
            );
          })
        ) : (
          filteredCommands.map((command, index) => {
            const Icon = COMMAND_ICONS[command.id] || Landmark;
            return (
              <SlashCommandRow
                key={command.id}
                id={`slash-option-${command.id}`}
                icon={Icon}
                title={t(command.labelKey)}
                description={t(command.descriptionKey)}
                isActive={index === slashState.activeIndex}
                onSelect={() => selectCommand(command)}
              />
            );
          })
        )}
      </div>
    );
  };

  return (
    <form
      ref={rootRef}
      onSubmit={handleSubmit}
      className="relative flex min-w-0 flex-col"
    >
      {renderSlashMenu()}
      <SelectedCommandChip selection={selectedCommand} onClear={onClearCommand} />
      <div className="flex min-w-0 items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t("assistant.inputPlaceholder")}
          aria-label={t("assistant.composerLabel")}
          rows={1}
          disabled={false}
          className="max-h-36 min-h-11 min-w-0 resize-none rounded-md py-3"
        />
        <Button
          type="submit"
          variant="ai"
          size="md"
          disabled={!canSend}
          isLoading={isSending}
          className="h-11 w-11 shrink-0 rounded-full p-0"
          aria-label={t("assistant.send")}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

