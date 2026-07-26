import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Send, AlertTriangle, Sparkles, User, HelpCircle } from "lucide-react"
import { useDirection } from "../../hooks/use-direction"
import { cn } from "../../lib/utils"

/* AI Message Bubble Component */
export function AiMessageBubble({
  message,
  citation,
  isLowConfidence = false,
  isRtl = true
}) {
  return (
    <div className="flex flex-col gap-2 max-w-[85%] text-start self-start">
      <div className="flex items-center gap-2">
        {/* Seal Mark AI Avatar */}
        <div className="w-6 h-6 rounded-full bg-[var(--teal-500)] text-[var(--stone-0)] flex items-center justify-center rotate-45 select-none shrink-0">
          <Sparkles className="h-3 w-3 -rotate-45" />
        </div>
        <span className="text-[10px] font-semibold text-[var(--teal-600)] dark:text-[var(--teal-400)]">
          {isRtl ? "وكيل" : "Wakeel AI"}
        </span>
      </div>

      {/* Bubble Container */}
      <div
        className={cn(
          "bg-[var(--teal-25)] text-[var(--color-ink)] p-4 rounded-[var(--radius-xl)] dark:bg-[var(--teal-900)/20] dark:text-[var(--stone-100)] border border-[var(--teal-100)] dark:border-[var(--teal-900)]",
          isRtl ? "rounded-tr-[4px]" : "rounded-tl-[4px]"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>

      {/* Source Citation Chip */}
      {citation && (
        <button
          type="button"
          className="self-start text-[10px] font-semibold text-[var(--teal-700)] bg-[var(--teal-50)] px-2 py-0.5 rounded-[var(--radius-full)] border border-[var(--teal-100)] hover:bg-[var(--teal-100)] dark:bg-[var(--teal-950)] dark:border-[var(--teal-900)] dark:text-[var(--teal-300)] cursor-pointer transition-colors"
        >
          {citation}
        </button>
      )}

      {/* Confidence Warning Flag */}
      {isLowConfidence && (
        <div className="flex items-center gap-2 border border-amber-200 bg-amber-50/50 p-2.5 rounded-[var(--radius-md)] text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--status-warning-fg)]" />
          <span>{isRtl ? "هذا الجزء يحتاج مراجعة بشري" : "This section requires human review"}</span>
        </div>
      )}
    </div>
  )
}

/* User Message Bubble Component */
export function UserMessageBubble({ message, isRtl = true }) {
  return (
    <div className="flex flex-col gap-2 max-w-[85%] text-start self-end">
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
          {isRtl ? "أنت" : "You"}
        </span>
        <div className="w-6 h-6 rounded-full bg-[var(--stone-100)] text-[var(--text-primary)] flex items-center justify-center dark:bg-[var(--stone-800)] shrink-0">
          <User className="h-3.5 w-3.5" />
        </div>
      </div>

      <div
        className={cn(
          "bg-[var(--stone-100)] text-[var(--color-ink)] p-4 rounded-[var(--radius-xl)] dark:bg-[var(--stone-850)] dark:text-[var(--stone-100)] border border-[var(--border-default)] dark:border-[var(--stone-800)]",
          isRtl ? "rounded-tl-[4px]" : "rounded-tr-[4px]"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  )
}

/* AI Thinking State Component */
export function AiThinkingState({ label, isRtl = true }) {
  return (
    <div className="flex items-center gap-3 self-start text-start py-2 select-none">
      {/* Ink-Bloom Inhale/Exhale Avatar */}
      <div className="w-8 h-8 rounded-full bg-[var(--teal-50)] dark:bg-[var(--teal-900)/30] flex items-center justify-center relative shrink-0">
        <div className="absolute inset-0 rounded-full bg-[var(--teal-100)] dark:bg-[var(--teal-800)] animate-ink-bloom opacity-70" />
        <Sparkles className="h-4 w-4 text-[var(--teal-600)] dark:text-[var(--teal-400)] relative z-10" />
      </div>
      <span className="text-xs text-[var(--teal-600)] dark:text-[var(--teal-400)] font-medium">
        {label || (isRtl ? "جاري البحث في قانون العمل المصري..." : "Searching Egyptian Labor Law...")}
      </span>
    </div>
  )
}

/* AI Chat Suggestions Row */
export function AiSuggestions({ suggestions = [], onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-start select-none py-1">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] bg-[var(--teal-50)] text-xs text-[var(--teal-700)] border border-[var(--teal-100)] hover:bg-[var(--teal-100)] dark:bg-[var(--teal-950)] dark:border-[var(--teal-900)] dark:text-[var(--teal-300)] cursor-pointer transition-colors whitespace-nowrap"
        >
          <HelpCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  )
}

/* Voice Recorder Button Component */
export function VoiceButton({ isActive, onStart, onEnd, isRtl = true }) {
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
      {/* Concentric amplitude waves when active */}
      {isActive &&
        amplitudeArr.map((scale, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-[var(--teal-400)] opacity-20 -z-10"
            style={{
              width: 44 + idx * 12,
              height: 44 + idx * 12
            }}
            animate={{ scale: scale }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          />
        ))}

      <button
        onPointerDown={onStart}
        onPointerUp={onEnd}
        type="button"
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer select-none text-[var(--stone-0)] shrink-0",
          isActive
            ? "bg-[var(--status-error)] hover:bg-rose-600"
            : "bg-[var(--teal-500)] hover:bg-[var(--teal-600)]"
        )}
      >
        <Mic className="h-5 w-5" />
      </button>
    </div>
  )
}
