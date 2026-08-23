import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, HelpCircle, Mic, Sparkles, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { WakeelLogo } from "../brand/wakeel-logo";
import { useLocale } from "../../hooks/use-locale";

export function AiMessageBubble({
  message,
  citation,
  confidence,
  isLowConfidence = false,
}) {
  const { isRtl, t } = useLocale();

  return (
    <div className="flex flex-col gap-2 max-w-[85%] text-start self-start">
      <div className="flex items-center gap-2">
        <WakeelLogo framed className="h-7 w-7 p-1" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-(--ai-primary)">
          {isRtl ? "وكيل" : "Wakeel AI"}
        </span>
      </div>

      <div
        className={cn(
          "bg-(--ai-surface) text-(--text-primary) p-4 rounded-xl border border-(--border-emphasis) shadow-(--shadow-1)",
          isRtl ? "rounded-tr-xs" : "rounded-tl-xs",
        )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>

      {citation && (
        <button
          type="button"
          className="self-start inline-flex items-center gap-1.5 text-[10px] font-semibold text-(--brand-primary) bg-(--bg-card) px-2.5 py-1 rounded-(--radius-full) border border-(--ai-primary) hover:bg-(--ai-surface) cursor-pointer transition-colors shadow-(--shadow-1)">
          <WakeelLogo framed className="h-4 w-4 rounded-xs p-0.5" />
          <span>{citation}</span>
          {confidence && (
            <span className="font-mono text-[9px] text-(--text-secondary)">
              {confidence}
            </span>
          )}
        </button>
      )}

      {isLowConfidence && (
        <div className="flex items-center gap-2 border border-(--status-warning-fg) bg-(--status-warning-bg) p-2.5 rounded-md text-xs text-(--status-warning-fg)">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {t("assistant.humanReview")}
          </span>
        </div>
      )}
    </div>
  );
}

export function UserMessageBubble({ message }) {
  const { isRtl, t } = useLocale();

  return (
    <div className="flex flex-col gap-2 max-w-[85%] text-start self-end">
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[10px] font-semibold text-(--text-secondary)">
          {t("assistant.you")}
        </span>
        <div className="w-6 h-6 rounded-full bg-(--bg-page-alt) text-(--text-primary) flex items-center justify-center border border-(--border-default) shrink-0">
          <User className="h-3.5 w-3.5" />
        </div>
      </div>

      <div
        className={cn(
          "bg-(--bg-page-alt) text-(--text-primary) p-4 rounded-xl border border-(--border-default)",
          isRtl ? "rounded-tl-xs" : "rounded-tr-xs",
        )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}

export function AiThinkingState({ label }) {
  const { isRtl, t } = useLocale();

  return (
    <div className="flex items-center gap-3 self-start text-start py-2 select-none">
      <div className="w-8 h-8 rounded-full bg-(--ai-surface) flex items-center justify-center relative shrink-0">
        <div className="absolute inset-0 rounded-full bg-(--ai-primary) animate-ink-bloom opacity-20" />
        <Sparkles className="h-4 w-4 text-(--ai-primary) relative z-10" />
      </div>
      <span className="text-xs text-(--ai-primary) font-medium">
        {label || t("assistant.searching")}
      </span>
    </div>
  );
}

export function AiSuggestions({ suggestions = [], onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-start select-none py-1">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-(--radius-full) bg-(--ai-surface) text-xs text-(--brand-primary) border border-(--border-emphasis) hover:border-(--ai-primary) cursor-pointer transition-colors whitespace-nowrap">
          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-(--ai-primary)" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  );
}

export function VoiceButton({ isActive, onStart, onEnd }) {
  const [amplitudeArr, setAmplitudeArr] = useState([1, 1, 1]);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setAmplitudeArr([
          Math.random() * 1.5 + 0.5,
          Math.random() * 2 + 0.5,
          Math.random() * 1.2 + 0.5,
        ]);
      }, 100);
    } else {
      setAmplitudeArr([1, 1, 1]);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative flex items-center justify-center shrink-0">
      {isActive &&
        amplitudeArr.map((scale, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-(--ai-primary) opacity-20 -z-10"
            style={{
              width: 44 + idx * 12,
              height: 44 + idx * 12,
            }}
            animate={{ scale }}
            transition={{ duration: 0.12 }}
          />
        ))}

      <button
        onPointerDown={onStart}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
        type="button"
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer select-none shrink-0",
          isActive
            ? "bg-(--status-error-fg) text-paper"
            : "bg-(--ai-primary) text-(--text-on-accent) hover:bg-(--accent-primary-hover)",
        )}>
        <Mic className="h-5 w-5" />
      </button>
    </div>
  );
}
