import React from "react";
import { Calculator, CalendarDays, FileText, HelpCircle, LockKeyhole, ShieldQuestion } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";

const stringifyValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export function resolveDocumentDraftRoute(card) {
  if (!card?.docId) return null;
  return `/hr/documents/${encodeURIComponent(String(card.docId))}`;
}

function ResultShell({ icon: Icon, title, badge, children }) {
  return (
    <div className="mt-4 rounded-md border border-(--border-default) bg-(--bg-card) p-4 shadow-(--shadow-1)">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-(--border-default) bg-(--ai-surface) text-(--ai-primary)">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 text-start">
            <h3 className="truncate text-sm font-semibold text-(--text-primary)">{title}</h3>
            {badge && <p className="mt-0.5 text-xs text-(--text-secondary)">{badge}</p>}
          </div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-(--border-default) py-2 text-sm last:border-b-0">
      <span className="text-(--text-secondary)">{label}</span>
      <span className="text-end font-medium text-(--text-primary)">{value}</span>
    </div>
  );
}

function CalculationCard({ card }) {
  const { t } = useTranslation();
  const inputs = Object.entries(card.inputs || {})
    .map(([key, value]) => [key, stringifyValue(value)])
    .filter(([, value]) => value);

  return (
    <ResultShell
      icon={Calculator}
      title={card.calculationType || t("assistant.resultCards.calculation")}
      badge={t("assistant.resultCards.calculationBadge")}
    >
      <div className="rounded-sm bg-(--bg-card-subtle) p-3">
        <span className="text-xs font-semibold uppercase text-(--text-secondary)">
          {t("assistant.resultCards.result")}
        </span>
        <div className="mt-1 text-2xl font-semibold text-(--brand-primary)">
          {stringifyValue(card.result) || t("common.unknown")}
          {card.currency && <span className="ms-2 text-base text-(--text-secondary)">{card.currency}</span>}
        </div>
      </div>

      {inputs.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase text-(--text-secondary)">
            {t("assistant.resultCards.inputs")}
          </h4>
          <div className="mt-1 rounded-sm border border-(--border-default) px-3">
            {inputs.map(([key, value]) => (
              <DetailRow key={key} label={key} value={value} />
            ))}
          </div>
        </div>
      )}

      {card.breakdown?.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase text-(--text-secondary)">
            {t("assistant.resultCards.breakdown")}
          </h4>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-(--text-primary)">
            {card.breakdown.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </ResultShell>
  );
}

function DocumentDraftCard({ card, onReview }) {
  const { t } = useTranslation();
  const route = resolveDocumentDraftRoute(card);
  const canReview = Boolean(route);

  return (
    <ResultShell
      icon={FileText}
      title={t("assistant.resultCards.documentDraftCreated")}
      badge={card.docId}
    >
      <div className="flex flex-col gap-2">
        <DetailRow label={t("assistant.resultCards.documentType")} value={card.docType} />
        <DetailRow label={t("assistant.resultCards.employee")} value={card.employeeName || card.employeeId} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="legal"
          size="sm"
          disabled={!canReview}
          onClick={() => canReview && onReview?.(card)}
        >
          <FileText className="h-4 w-4" />
          {t("assistant.resultCards.reviewDraft")}
        </Button>
        {!canReview && (
          <span className="inline-flex items-center gap-1.5 text-xs text-(--text-secondary)">
            <LockKeyhole className="h-3.5 w-3.5" />
            {t("assistant.resultCards.reviewRoutePending")}
          </span>
        )}
      </div>
    </ResultShell>
  );
}

function LeaveDraftCard({ card }) {
  const { t } = useTranslation();

  return (
    <ResultShell
      icon={CalendarDays}
      title={t("assistant.resultCards.leaveDraftCreated")}
      badge={card.requestId}
    >
      <div className="rounded-sm border border-(--border-default) px-3">
        <DetailRow label={t("leave.leaveType")} value={card.leaveType} />
        <DetailRow label={t("leave.startDate")} value={card.startDate} />
        <DetailRow label={t("leave.endDate")} value={card.endDate} />
        <DetailRow label={t("leave.duration")} value={stringifyValue(card.daysRequested)} />
        {card.attachmentUploaded !== null && card.attachmentUploaded !== undefined && (
          <DetailRow
            label={t("leave.attachment")}
            value={card.attachmentUploaded ? t("assistant.resultCards.attachmentUploaded") : t("assistant.resultCards.noAttachment")}
          />
        )}
      </div>

      {card.actions?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {card.actions.map((action) => (
            <Button key={action} type="button" variant="secondary" size="sm" disabled>
              {action}
            </Button>
          ))}
        </div>
      )}
    </ResultShell>
  );
}

function ConfirmationCard({ card, onSendMessage }) {
  const { t } = useTranslation();

  return (
    <ResultShell icon={ShieldQuestion} title={card.message || t("assistant.resultCards.confirmationDefaultMessage")}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="legal"
          size="sm"
          onClick={() => onSendMessage?.(card.confirmPrompt || t("assistant.resultCards.confirmReply"))}
        >
          {t("assistant.resultCards.confirm")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onSendMessage?.(card.cancelPrompt || t("assistant.resultCards.cancelReply"))}
        >
          {t("assistant.resultCards.cancel")}
        </Button>
      </div>
    </ResultShell>
  );
}

function DisambiguationCard({ card, onSendMessage }) {
  const { t } = useTranslation();

  return (
    <ResultShell icon={HelpCircle} title={card.message || t("assistant.resultCards.disambiguationDefaultMessage")}>
      <div className="flex flex-col gap-2">
        {card.options.map((option, index) => {
          const label =
            option.label ||
            [option.leaveType, option.startDate && option.endDate ? `${option.startDate} - ${option.endDate}` : null]
              .filter(Boolean)
              .join(" · ");

          return (
            <Button
              key={option.requestId || index}
              type="button"
              variant="secondary"
              size="sm"
              className="justify-start"
              onClick={() => onSendMessage?.(label || t("assistant.resultCards.disambiguationOptionFallback", { index: index + 1 }))}
            >
              {label || t("assistant.resultCards.disambiguationOptionFallback", { index: index + 1 })}
            </Button>
          );
        })}
      </div>
    </ResultShell>
  );
}

export function AssistantResultCard({ card, onReviewDocument, onSendMessage }) {
  const { t } = useTranslation();

  if (!card) return null;

  if (card.type === "calculation") {
    return <CalculationCard card={card} />;
  }

  if (card.type === "document_draft") {
    return <DocumentDraftCard card={card} onReview={onReviewDocument} />;
  }

  if (card.type === "leave_draft") {
    return <LeaveDraftCard card={card} />;
  }

  if (card.type === "confirmation") {
    return <ConfirmationCard card={card} onSendMessage={onSendMessage} />;
  }

  if (card.type === "needs_disambiguation") {
    return <DisambiguationCard card={card} onSendMessage={onSendMessage} />;
  }

  return (
    <div className="mt-4 rounded-md border border-(--border-default) bg-(--bg-card) p-4">
      <Badge variant="info">{card.type || t("common.unknown")}</Badge>
    </div>
  );
}
