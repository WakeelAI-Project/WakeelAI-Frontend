import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NAV_ITEMS } from "./sidebar";

const COMMAND_NAV_IDS = new Set(["employees", "documents", "leave"]);

export function CommandPalette({ isOpen, onClose, onOpen, onNavSelect }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (isOpen) onClose();
        else onOpen?.();
      }
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const normalizedQuery = query.trim().toLowerCase();
  const isAiQuery =
    normalizedQuery.startsWith("draft") ||
    normalizedQuery.startsWith("calculate");

  const navigationResults = NAV_ITEMS.filter((item) => COMMAND_NAV_IDS.has(item.id))
    .map((item) => ({
      ...item,
      label: t(item.labelKey),
    }))
    .filter(
      (item) =>
        normalizedQuery &&
        (item.label.toLowerCase().includes(normalizedQuery) ||
          item.id.includes(normalizedQuery)),
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-(--overlay-scrim)"
          />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="relative z-50 flex w-full max-w-xl flex-col overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-card) shadow-(--shadow-4)">
            <div className="flex shrink-0 items-center border-b border-(--border-default) px-4 py-3">
              <Search className="me-3 h-5 w-5 shrink-0 text-(--text-muted) opacity-55" />
              <input
                ref={inputRef}
                type="text"
                placeholder={t("commandPalette.placeholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-1 border-0 bg-transparent text-start text-base text-(--text-primary) outline-none placeholder:text-(--text-muted)"
              />
            </div>

            <div className="max-h-90 overflow-y-auto p-2">
              {query === "" ? (
                <div className="p-4 text-center text-sm text-(--text-secondary)">
                  {t("commandPalette.typeToStart")}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {(isAiQuery || query.length > 3) && (
                    <button
                      onClick={() => {
                        onNavSelect("assistant", query);
                        onClose();
                      }}
                      className="flex w-full cursor-pointer items-center justify-between rounded-md border border-(--border-emphasis) bg-(--ai-surface) p-3 text-start transition-colors hover:border-(--ai-primary)">
                      <span className="flex min-w-0 items-center gap-3">
                        <Sparkles className="h-5 w-5 shrink-0 text-(--ai-primary)" />
                        <span className="flex min-w-0 flex-col">
                          <span className="wrap-break-word text-sm font-semibold text-(--brand-primary)">
                            {t("commandPalette.aiAction", { query })}
                          </span>
                          <span className="text-xs text-(--text-secondary)">
                            {t("commandPalette.aiDescription")}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-(--ai-primary) rtl:rotate-180" />
                    </button>
                  )}

                  {navigationResults.length > 0 && (
                    <div className="mt-2 px-2 pb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
                        {t("commandPalette.navigation")}
                      </span>
                    </div>
                  )}

                  {navigationResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavSelect(item.id);
                          onClose();
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-md p-3 text-start transition-colors hover:bg-(--bg-page-alt)">
                        <Icon className="h-5 w-5 shrink-0 text-(--text-muted)" />
                        <span className="text-sm font-medium text-(--text-primary)">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}

                  {navigationResults.length === 0 && !isAiQuery && (
                    <div className="p-8 text-center text-sm text-(--text-secondary)">
                      {t("commandPalette.noResults")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-4 border-t border-(--border-default) bg-(--bg-card-subtle) p-3 text-[11px] text-(--text-muted) select-none">
              <span>
                <kbd className="me-1 rounded border px-1.5 py-0.5 font-sans">
                  Enter
                </kbd>
                {t("commandPalette.selectHint")}
              </span>
              <span>
                <kbd className="me-1 rounded border px-1.5 py-0.5 font-sans">
                  Esc
                </kbd>
                {t("commandPalette.closeHint")}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
