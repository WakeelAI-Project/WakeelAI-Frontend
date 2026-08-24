import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WakeelLogo } from "../../../../components/brand/wakeel-logo";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { AssistantSources } from "./assistant-sources";
import { AssistantResultCard } from "./assistant-result-card";
import { MissingFieldsForm } from "./missing-fields-form";
import { MarkdownRenderer } from "./markdown-renderer";

const ARABIC_TEXT_PATTERN = /[\u0600-\u06FF]/;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return prefersReducedMotion;
}

function useTypewriterText({ text, enabled, onComplete }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visibleText, setVisibleText] = useState(enabled ? "" : text);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!enabled || prefersReducedMotion || text.length <= 12) {
      setVisibleText(text);
      onCompleteRef.current?.();
      return undefined;
    }

    let index = 0;
    let cancelled = false;
    setVisibleText("");

    const intervalId = window.setInterval(() => {
      if (cancelled) return;
      index = Math.min(index + 4, text.length);
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(intervalId);
        onCompleteRef.current?.();
      }
    }, 18);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, prefersReducedMotion, text]);

  return visibleText;
}

export function ChatMessage({
  message,
  isProgressive,
  onProgressiveComplete,
  onSubmitMissingFields,
  isSending,
  onReviewDocument,
  onSendMessage,
}) {
  const { t } = useTranslation();
  const isAssistant = message.role === "assistant";
  const direction = ARABIC_TEXT_PATTERN.test(message.content) ? "rtl" : "ltr";
  const visibleText = useTypewriterText({
    text: message.content,
    enabled: isAssistant && isProgressive,
    onComplete: () => onProgressiveComplete?.(message.id),
  });

  // The chat layout (which side each role sits on, header row order, bubble
  // "tail" corner) is intentionally pinned to a fixed physical direction —
  // it must match the English layout regardless of app language. Only the
  // text *inside* each bubble follows its own detected direction (below).
  // `justify-end`/`items-end`/etc. are logical (writing-mode relative), so
  // without an explicit dir="ltr" here they'd silently flip under the app's
  // dir="rtl" root when the UI language is Arabic.
  if (!isAssistant) {
    return (
      <article dir="ltr" className="flex w-full justify-end">
        <div className="flex max-w-[min(38rem,85%)] flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-(--text-secondary)">
              {t("assistant.you")}
            </span>
            <Avatar className="h-7 w-7">
              <AvatarFallback>
                <User className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div
            dir={direction}
            className="rounded-xl border border-(--border-default) bg-(--bg-page-alt) p-4 text-(--text-primary) rounded-tr-xs"
          >
            <MarkdownRenderer text={message.content} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article dir="ltr" className="flex w-full justify-start">
      <div className="flex max-w-[min(42rem,90%)] flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <WakeelLogo framed className="h-7 w-7 p-1" />
          <span className="text-[11px] font-semibold uppercase text-(--ai-primary)">
            {t("assistant.identity")}
          </span>
        </div>

        <div
          dir={direction}
          className="rounded-xl border border-(--border-emphasis) bg-(--ai-surface) p-4 text-(--text-primary) shadow-(--shadow-1) rounded-tl-xs"
        >
          {visibleText ? (
            <MarkdownRenderer text={visibleText} />
          ) : (
            <span className="text-sm text-(--text-secondary)">{t("assistant.thinking")}</span>
          )}
        </div>

        <AssistantSources sources={message.sources} />
        <AssistantResultCard card={message.resultCard} onReviewDocument={onReviewDocument} onSendMessage={onSendMessage} />
        {message.missingFields?.length > 0 && (
          <MissingFieldsForm
            fields={message.missingFields}
            isSending={isSending}
            onSubmit={onSubmitMissingFields}
          />
        )}
        {message.isLowConfidence && (
          <div className="flex items-center gap-2 rounded-md border border-(--status-warning-fg) bg-(--status-warning-bg) p-2.5 text-xs text-(--status-warning-fg)">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{t("assistant.humanReview")}</span>
          </div>
        )}
      </div>
    </article>
  );
}
