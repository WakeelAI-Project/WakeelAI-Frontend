import React, { useState } from "react"
import { Send } from "lucide-react"
import { AiMessageBubble, AiSuggestions, AiThinkingState, UserMessageBubble, VoiceButton } from "../components/ai/ai-chat"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { assistantThread } from "../data/mock/dashboard"
import { PageShell } from "./page-shell"

export function AssistantPage({ isRtl }) {
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)

  return (
    <PageShell
      isRtl={isRtl}
      eyebrow="AI With Evidence"
      eyebrowAr="ذكاء اصطناعي بإسناد"
      title="AI Assistant"
      titleAr="المساعد الذكي"
      description="Wakeel answers with cited labor-law sources, confidence, and an auditable trail."
      descriptionAr="يجيب وكيل مع مراجع قانونية ونسبة ثقة ومسار قابل للتدقيق."
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
                isRtl={isRtl}
              />
            ) : (
              <UserMessageBubble
                key={message.id}
                message={isRtl ? message.message : message.messageEn}
                isRtl={isRtl}
              />
            )
          )}
          <AiThinkingState label={isRtl ? "جاري صياغة بند العمل الإضافي..." : "Drafting overtime clause..."} isRtl={isRtl} />
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
              placeholder={isRtl ? "اسأل وكيل عن أي بند أو قانون..." : "Ask Wakeel about any regulation..."}
            />
            <VoiceButton
              isActive={isVoiceRecording}
              onStart={() => setIsVoiceRecording(true)}
              onEnd={() => setIsVoiceRecording(false)}
            />
            <Button variant="ai" className="h-10 w-10 p-0 rounded-full shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
