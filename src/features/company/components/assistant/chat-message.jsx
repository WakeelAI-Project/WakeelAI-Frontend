import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SealMark } from "../../../../components/brand/seal-mark";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { cn } from "../../../../lib/utils";
import { useLocale } from "../../../../hooks/use-locale";
import { AssistantSources } from "./assistant-sources";
import { AssistantResultCard } from "./assistant-result-card";
import { MissingFieldsForm } from "./missing-fields-form";

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

function MarkdownLite({ text }) {
  const blocks = useMemo(() => (
    text
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
  ), [text]);

  if (!blocks.length) return null;

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const isBulletList = lines.every((line) => /^[-*•]\s+/.test(line));
        const isNumberedList = lines.every((line) => /^\d+[.)]\s+/.test(line));

        if (isBulletList) {
          return (
            <ul key={`${block}-${blockIndex}`} className="list-disc space-y-1 ps-5">
              {lines.map((line, index) => (
                <li key={`${line}-${index}`}>{line.replace(/^[-*•]\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={`${block}-${blockIndex}`} className="list-decimal space-y-1 ps-5">
              {lines.map((line, index) => (
                <li key={`${line}-${index}`}>{line.replace(/^\d+[.)]\s+/, "")}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block}-${blockIndex}`} className="whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export function ChatMessage({
  message,
  isProgressive,
  onProgressiveComplete,
  onSubmitMissingFields,
  isSending,
  onReviewDocument,
}) {
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const isAssistant = message.role === "assistant";
  const direction = ARABIC_TEXT_PATTERN.test(message.content) ? "rtl" : "ltr";
  const visibleText = useTypewriterText({
    text: message.content,
    enabled: isAssistant && isProgressive,
    onComplete: () => onProgressiveComplete?.(message.id),
  });

  if (!isAssistant) {
    return (
      <article className="flex w-full justify-end">
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
            className={cn(
              "rounded-xl border border-(--border-default) bg-(--bg-page-alt) p-4 text-(--text-primary)",
              isRtl ? "rounded-tl-xs" : "rounded-tr-xs",
            )}
          >
            <MarkdownLite text={message.content} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex w-full justify-start">
      <div className="flex max-w-[min(42rem,90%)] flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <SealMark className="h-7 w-7" iconClassName="h-2.5 w-2.5" />
          <span className="text-[11px] font-semibold uppercase text-(--ai-primary)">
            {t("assistant.identity")}
          </span>
        </div>

        <div
          dir={direction}
          className={cn(
            "rounded-xl border border-(--border-emphasis) bg-(--ai-surface) p-4 text-(--text-primary) shadow-(--shadow-1)",
            isRtl ? "rounded-tr-xs" : "rounded-tl-xs",
          )}
        >
          {visibleText ? (
            <MarkdownLite text={visibleText} />
          ) : (
            <span className="text-sm text-(--text-secondary)">{t("assistant.thinking")}</span>
          )}
        </div>

        <AssistantSources sources={message.sources} />
        <AssistantResultCard card={message.resultCard} onReviewDocument={onReviewDocument} />
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
