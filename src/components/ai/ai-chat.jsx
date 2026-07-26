import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, HelpCircle, Mic, Sparkles, User } from "lucide-react"
import { cn } from "../../lib/utils"
import { SealMark } from "../brand/seal-mark"

export function AiMessageBubble({
  message,
  citation,
  confidence,
  isLowConfidence = false,
  isRtl = true
}) {
  return (
    <div className="flex flex-col gap-2 max-w-[85%] text-start self-start">
      <div className="flex items-center gap-2">
        <SealMark className="h-7 w-7" iconClassName="h-2.5 w-2.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ai-primary)]">
          {isRtl ? "وكيل" : "Wakeel AI"}
        </span>
      </div>

      <div
        className={cn(
          "bg-[var(--ai-surface)] text-[var(--text-primary)] p-4 rounded-[var(--radius-xl)] border border-[var(--border-emphasis)] shadow-[var(--shadow-1)]",
          isRtl ? "rounded-tr-[4px]" : "rounded-tl-[4px]"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>

      {citation && (
        <button
          type="button"
          className="self-start inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--brand-primary)] bg-[var(--bg-card)] px-2.5 py-1 rounded-[var(--radius-full)] border border-[var(--ai-primary)] hover:bg-[var(--ai-surface)] cursor-pointer transition-colors shadow-[var(--shadow-1)]"
        >
          <SealMark className="h-4 w-4 border bg-[var(--bg-card)]" iconClassName="h-2 w-2" />
          <span>{citation}</span>
          {confidence && (
            <span className="font-mono text-[9px] text-[var(--text-secondary)]">
              {confidence}
            </span>
          )}
        </button>
      )}

      {isLowConfidence && (
        <div className="flex items-center gap-2 border border-[var(--status-warning-fg)] bg-[var(--status-warning-bg)] p-2.5 rounded-[var(--radius-md)] text-xs text-[var(--status-warning-fg)]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{isRtl ? "هذا الجزء يحتاج مراجعة بشرية" : "This section requires human review"}</span>
        </div>
      )}
    </div>
  )
}

export function UserMessageBubble({ message, isRtl = true }) {
  return (
    <div className="flex flex-col gap-2 max-w-[85%] text-start self-end">
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
          {isRtl ? "أنت" : "You"}
        </span>
        <div className="w-6 h-6 rounded-full bg-[var(--bg-page-alt)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-default)] shrink-0">
          <User className="h-3.5 w-3.5" />
        </div>
      </div>

      <div
        className={cn(
          "bg-[var(--bg-page-alt)] text-[var(--text-primary)] p-4 rounded-[var(--radius-xl)] border border-[var(--border-default)]",
          isRtl ? "rounded-tl-[4px]" : "rounded-tr-[4px]"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  )
}

export function AiThinkingState({ label, isRtl = true }) {
  return (
    <div className="flex items-center gap-3 self-start text-start py-2 select-none">
      <div className="w-8 h-8 rounded-full bg-[var(--ai-surface)] flex items-center justify-center relative shrink-0">
        <div className="absolute inset-0 rounded-full bg-[var(--ai-primary)] animate-ink-bloom opacity-20" />
        <Sparkles className="h-4 w-4 text-[var(--ai-primary)] relative z-10" />
      </div>
      <span className="text-xs text-[var(--ai-primary)] font-medium">
        {label || (isRtl ? "جاري البحث في قانون العمل المصري..." : "Searching Egyptian Labor Law...")}
      </span>
    </div>
  )
}

export function AiSuggestions({ suggestions = [], onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-start select-none py-1">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] bg-[var(--ai-surface)] text-xs text-[var(--brand-primary)] border border-[var(--border-emphasis)] hover:border-[var(--ai-primary)] cursor-pointer transition-colors whitespace-nowrap"
        >
          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-[var(--ai-primary)]" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  )
}

export function VoiceButton({ isActive, onStart, onEnd }) {
  const [amplitudeArr, setAmplitudeArr] = useState([1, 1, 1])

  useEffect(() => {
    let interval
    if (isActive) {
      interval = setInterval(() => {
        setAmplitudeArr([
          Math.random() * 1.5 + 0.5,
          Math.random() * 2 + 0.5,
          Math.random() * 1.2 + 0.5
        ])
      }, 100)
    } else {
      setAmplitudeArr([1, 1, 1])
    }
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="relative flex items-center justify-center shrink-0">
      {isActive &&
        amplitudeArr.map((scale, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-[var(--ai-primary)] opacity-20 -z-10"
            style={{
              width: 44 + idx * 12,
              height: 44 + idx * 12
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
            ? "bg-[var(--status-error-fg)] text-[var(--color-paper)]"
            : "bg-[var(--ai-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-primary-hover)]"
        )}
      >
        <Mic className="h-5 w-5" />
      </button>
    </div>
  )
}
