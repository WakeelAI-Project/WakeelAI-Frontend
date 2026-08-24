import React, { useEffect, useRef, useState } from "react";
import { Menu, RotateCcw } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../../../components/overlay/drawer";
import { useLocale } from "../../../../hooks/use-locale";
import { cn } from "../../../../lib/utils";
import { useAssistantStore } from "../../store/assistant-store";
import { ChatMessage } from "./chat-message";
import { AssistantComposer } from "./assistant-composer";
import { AssistantEmptyState } from "./assistant-empty-state";
import { ConversationSidebar } from "./conversation-sidebar";
import { resolveDocumentDraftRoute } from "./assistant-result-card";
import { getSlashCommandFieldValues } from "./slash-commands";

function getRequestLanguage(language) {
  return language?.startsWith("ar") ? "AR" : "EN";
}

function getErrorCopy(t, error) {
  if (!error) return null;

  const retryAfter = error.retryAfterSeconds
    ? t("assistant.errors.retryAfter", { seconds: error.retryAfterSeconds })
    : "";

  const keyByCode = {
    validation_error: "assistant.errors.validation",
    unauthorized: "assistant.errors.unauthorized",
    forbidden: "assistant.errors.forbidden",
    not_found: "assistant.errors.notFound",
    conflict: "assistant.errors.conflict",
    rate_limited: "assistant.errors.rateLimited",
    service_unavailable: "assistant.errors.serviceUnavailable",
    network_error: "assistant.errors.network",
  };

  return {
    title: t("assistant.errors.title"),
    description: `${t(keyByCode[error.code] || "assistant.errors.generic")}${retryAfter ? ` ${retryAfter}` : ""}`,
  };
}

function ErrorBanner({ error, onRetry, canRetry }) {
  const { t } = useTranslation();
  const copy = getErrorCopy(t, error);

  if (!copy) return null;

  return (
    <div className="mx-4 mb-3 rounded-md border border-(--status-error-fg) bg-(--status-error-bg) p-3 text-start text-sm text-(--status-error-fg)">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">{copy.title}</h3>
          <p className="mt-1 text-xs leading-relaxed">{copy.description}</p>
        </div>
        {canRetry && (
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" />
            {t("common.retry")}
          </Button>
        )}
      </div>
    </div>
  );
}

function HistoryLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Skeleton className="h-24 w-4/5" />
      <Skeleton className="ms-auto h-20 w-3/5" />
      <Skeleton className="h-28 w-5/6" />
    </div>
  );
}

function ThinkingBubble() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full justify-start">
      <div className="rounded-xl border border-(--border-emphasis) bg-(--ai-surface) px-4 py-3 text-sm text-(--ai-primary) shadow-(--shadow-1)">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-(--ai-primary)" />
          {t("assistant.searching")}
        </span>
      </div>
    </div>
  );
}

export function AssistantChat({ className }) {
  const { t } = useTranslation();
  const { language } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [composerValue, setComposerValue] = useState("");
  const [selectedSlashCommand, setSelectedSlashCommand] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  const locationTargetEmployeeId = location.state?.targetEmployeeId;
  const locationTargetEmployeeName = location.state?.targetEmployeeName;

  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingHistory,
    isLoadingConversations,
    isSending,
    error,
    retryableMessage,
    progressiveMessageId,
    conversationListStatus,
    loadConversations,
    startNewConversation,
    selectConversation,
    sendMessage,
    submitMissingFields,
    retryLastMessage,
    markProgressiveComplete,
    deleteConversation,
    targetContext,
    setTargetContext,
  } = useAssistantStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, isSending, progressiveMessageId]);

  useEffect(() => {
    if (locationTargetEmployeeId && locationTargetEmployeeName) {
      startNewConversation();
      setSelectedSlashCommand(null);
      setTargetContext({
        targetEmployeeId: locationTargetEmployeeId,
        targetEmployeeName: locationTargetEmployeeName,
      });
      navigate(".", { replace: true, state: {} });
    }
  }, [locationTargetEmployeeId, locationTargetEmployeeName, startNewConversation, setTargetContext, navigate]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentTargetName = activeConversation?.targetEmployeeName || targetContext?.targetEmployeeName;

  const requestLanguage = getRequestLanguage(language);

  const handleSend = async (message) => {
    const slashFieldValues = getSlashCommandFieldValues(selectedSlashCommand);
    const hasSlashFieldValues = Object.keys(slashFieldValues).length > 0;
    const sent = await sendMessage({
      message,
      language: requestLanguage,
      ...(hasSlashFieldValues ? { fieldValues: slashFieldValues } : {}),
    });

    if (sent) {
      setComposerValue("");
      setSelectedSlashCommand(null);
    }
  };

  const handlePrompt = (prompt) => {
    sendMessage({ message: prompt, language: requestLanguage });
  };

  const handleSubmitMissingFields = (fieldValues) => {
    submitMissingFields({
      fieldValues,
      language: requestLanguage,
      displayMessage: t("assistant.missingFields.providedDetails"),
    });
  };

  const handleSelectConversation = (conversationId) => {
    setIsDrawerOpen(false);
    setSelectedSlashCommand(null);
    selectConversation(conversationId);
  };

  const handleNewConversation = () => {
    setIsDrawerOpen(false);
    setSelectedSlashCommand(null);
    startNewConversation();
  };

  const handleReviewDocument = (card) => {
    const route = resolveDocumentDraftRoute(card);
    if (route) navigate(route);
  };

  const sidebar = (
    <ConversationSidebar
      conversations={conversations}
      activeConversationId={activeConversationId}
      isLoading={isLoadingConversations}
      status={conversationListStatus}
      onSelectConversation={handleSelectConversation}
      onNewConversation={handleNewConversation}
      onDeleteConversation={deleteConversation}
    />
  );

  return (
    <section className={cn("flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-card) shadow-(--shadow-2)", className)}>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="hidden min-h-0 lg:block">{sidebar}</div>

        <div className="flex min-h-0 min-w-0 flex-col">
          <div className="flex shrink-0 flex-col gap-3 border-b border-(--border-default) bg-(--bg-card-subtle) px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="min-w-0 text-start">
              <h2 className="truncate text-sm font-semibold text-(--text-primary)">
                {activeConversationId ? t("assistant.chat.activeTitle") : t("assistant.chat.newTitle")}
              </h2>
              <p className="mt-0.5 truncate text-xs text-(--text-secondary)">
                {currentTargetName
                  ? t("assistant.chat.askingAbout", { name: currentTargetName })
                  : (activeConversationId
                      ? t("assistant.chat.activeDescription", { defaultValue: "Ask questions, review policies, or draft documents." })
                      : t("assistant.chat.newDescription"))}
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-w-0 flex-1 sm:flex-none lg:hidden"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Menu className="h-4 w-4" />
                {t("assistant.conversations.title")}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="min-w-0 flex-1 sm:flex-none" onClick={handleNewConversation}>
                {t("assistant.conversations.new")}
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-(--bg-page)">
            {isLoadingHistory ? (
              <HistoryLoading />
            ) : messages.length === 0 ? (
              <AssistantEmptyState onSelectPrompt={handlePrompt} />
            ) : (
              <div className="flex min-w-0 flex-col gap-5 p-3 sm:p-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isProgressive={message.id === progressiveMessageId}
                    onProgressiveComplete={markProgressiveComplete}
                    onSubmitMissingFields={handleSubmitMissingFields}
                    isSending={isSending}
                    onReviewDocument={handleReviewDocument}
                  />
                ))}
                {isSending && <ThinkingBubble />}
                <div ref={scrollRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-(--border-default) bg-(--bg-card) p-3 sm:p-4">
            <ErrorBanner error={error} canRetry={Boolean(retryableMessage)} onRetry={retryLastMessage} />
            <AssistantComposer
              value={composerValue}
              onChange={setComposerValue}
              onSubmit={handleSend}
              isSending={isSending}
              selectedCommand={selectedSlashCommand}
              onSelectCommand={setSelectedSlashCommand}
              onClearCommand={() => setSelectedSlashCommand(null)}
            />
          </div>
        </div>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent side="start" className="p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t("assistant.conversations.title")}</DrawerTitle>
          </DrawerHeader>
          {sidebar}
        </DrawerContent>
      </Drawer>
    </section>
  );
}
