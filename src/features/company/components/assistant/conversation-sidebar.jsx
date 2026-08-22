import React, { useState } from "react";
import { MessageSquarePlus, MessagesSquare, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { ConfirmDialog } from "../../../../components/overlay/confirm-dialog";
import { Skeleton } from "../../../../components/ui/skeleton";
import { CONVERSATION_LIST_STATUS } from "../../services/assistant-service";
import { cn } from "../../../../lib/utils";

const isToday = (date) => {
  const current = new Date();
  return date.toDateString() === current.toDateString();
};

const isYesterday = (date) => {
  const current = new Date();
  current.setDate(current.getDate() - 1);
  return date.toDateString() === current.toDateString();
};

function groupConversations(conversations) {
  return conversations.reduce(
    (groups, conversation) => {
      const date = conversation.updatedAt
        ? new Date(conversation.updatedAt)
        : new Date();
      const key = isToday(date)
        ? "today"
        : isYesterday(date)
          ? "yesterday"
          : "earlier";
      groups[key].push(conversation);
      return groups;
    },
    { today: [], yesterday: [], earlier: [] },
  );
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  isLoading,
  status,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  className,
}) {
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const groups = groupConversations(conversations);
  const hasConversations = conversations.length > 0;
  const isPendingBackend =
    status === CONVERSATION_LIST_STATUS.PENDING_BACKEND_CONTRACT;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await onDeleteConversation?.(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-e border-(--border-default) bg-(--bg-card-subtle)",
        className,
      )}>
      <div className="border-b border-(--border-default) p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-start">
            <h2 className="truncate text-sm font-semibold text-(--text-primary)">
              {t("assistant.conversations.title")}
            </h2>
            <p className="mt-0.5 text-xs text-(--text-secondary)">
              {t("assistant.conversations.subtitle")}
            </p>
          </div>
          <Button
            type="button"
            variant="ai"
            size="sm"
            className="h-9 w-9 shrink-0 p-0"
            onClick={onNewConversation}
            aria-label={t("assistant.conversations.new")}>
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-5/6" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!isLoading && !hasConversations && (
          <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-(--border-default) bg-(--bg-card) p-5 text-center">
            <MessagesSquare className="mb-3 h-8 w-8 text-(--ai-primary)" />
            <h3 className="text-sm font-semibold text-(--text-primary)">
              {t("assistant.conversations.emptyTitle")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-(--text-secondary)">
              {isPendingBackend
                ? t("assistant.conversations.pendingBackend")
                : t("assistant.conversations.emptyDescription")}
            </p>
          </div>
        )}

        {!isLoading && hasConversations && (
          <div className="space-y-5">
            {Object.entries(groups).map(([groupKey, items]) => {
              if (!items.length) return null;

              return (
                <section key={groupKey} className="space-y-2">
                  <h3 className="px-2 text-[11px] font-semibold uppercase text-(--text-secondary)">
                    {t(`assistant.conversations.groups.${groupKey}`)}
                  </h3>
                  <div className="space-y-1">
                    {items.map((conversation) => {
                      const isActive = conversation.id === activeConversationId;
                      return (
                        <div
                          key={conversation.id}
                          className={cn(
                            "group relative flex w-full items-center justify-between rounded-sm border px-3 py-2 text-start transition-colors",
                            isActive
                              ? "border-(--ai-primary) bg-(--ai-surface) text-(--brand-primary)"
                              : "border-transparent text-(--text-primary) hover:border-(--border-default) hover:bg-(--bg-card)",
                          )}>
                          <button
                            type="button"
                            onClick={() =>
                              onSelectConversation(conversation.id)
                            }
                            className="flex-1 min-w-0 text-start">
                            <span className="block truncate text-sm font-semibold">
                              {conversation.title}
                            </span>
                            {conversation.lastMessage && (
                              <span className="mt-0.5 block truncate text-xs text-(--text-secondary)">
                                {conversation.lastMessage}
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(conversation);
                            }}
                            className="ms-2 shrink-0 rounded-sm p-1 text-(--text-secondary) opacity-100 transition-opacity hover:bg-black/10 hover:text-(--status-error-fg) sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label={t("common.delete")}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        title={t(
          "assistant.conversations.confirmDeleteTitle",
          "Delete conversation?",
        )}
        description={t(
          "assistant.conversations.confirmDeleteDescription",
          "This action cannot be undone. Are you sure you want to delete this conversation?",
        )}
        confirmText={t("common.delete", "Delete")}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </aside>
  );
}
