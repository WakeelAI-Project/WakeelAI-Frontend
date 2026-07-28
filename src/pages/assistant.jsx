import React, { useState } from "react"
import { Send } from "lucide-react"
import { AiMessageBubble, AiSuggestions, AiThinkingState, UserMessageBubble, VoiceButton } from "../components/ai/ai-chat"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { assistantThread } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"
import { useTranslation } from "react-i18next"
import { useLocale } from "../hooks/use-locale"

export function AssistantPage() {
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const { t } = useTranslation()
  const { isRtl } = useLocale()

  return (
    <PageShell
      eyebrow={t("assistant.evidence")}
      title={t("assistant.title")}
      description={t("assistant.description")}
    >
      <section className="mx-auto flex h-[620px] w-full max-w-3xl flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-2)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {assistantThread.map((message) =>
            message.role === "ai" ? (
              <AiMessageBubble
                key={message.id}
                message={isRtl ? message.message : message.messageEn}
                citation={isRtl ? message.citationAr : message.citation}
                confidence={message.confidence}
              />
            ) : (
              <UserMessageBubble
                key={message.id}
                message={isRtl ? message.message : message.messageEn}
              />
            )
          )}
          <AiThinkingState label={t("assistant.thinking")} />
        </div>

        <div className="p-4 border-t border-[var(--border-default)] flex flex-col gap-3 shrink-0">
          <AiSuggestions
            suggestions={
              isRtl
                ? ["كم رصيد إجازاتي السنوية؟", "صياغة عقد عمل مؤقت", "مراجعة بند عدم المنافسة"]
                : ["What is my leave balance?", "Draft temporary contract", "Review non-compete clause"]
            }
            onSelect={() => {}}
          />
          <div className="flex items-center gap-2">
            <Input
              className="flex-1 rounded-[var(--radius-2xl)]"
              placeholder={t("assistant.inputPlaceholder")}
            />
            <VoiceButton
              isActive={isVoiceRecording}
              onStart={() => setIsVoiceRecording(true)}
              onEnd={() => setIsVoiceRecording(false)}
            />
            <Button variant="ai" className="h-10 w-10 p-0 rounded-full shrink-0 cursor-pointer">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
