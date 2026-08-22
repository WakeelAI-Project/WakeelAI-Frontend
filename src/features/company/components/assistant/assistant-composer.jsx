import React, { useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/input";

export function AssistantComposer({ value, onChange, onSubmit, isSending }) {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  const canSend = value.trim().length > 0 && !isSending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    onSubmit(value);
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (canSend) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
    </form>
  );
}

