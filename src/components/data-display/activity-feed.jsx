import React from "react";
import { Sparkles, User, FileText, Calendar, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export function ActivityFeed({ items = [], isRtl: _isRtl = true, className }) {
  const domainIcons = {
    AI: Sparkles,
    employee: User,
    legal: FileText,
    leave: Calendar,
    system: AlertCircle,
  };

  const domainColors = {
    AI: "bg-(--ai-surface) text-(--ai-primary) dark:bg-(--accent-primary-active)/20 dark:text-(--ai-primary)",
    employee:
      "bg-(--official-surface) text-(--brand-primary-hover) dark:bg-(--brand-primary-active)/20 dark:text-(--brand-primary-hover)",
    legal:
      "bg-(--accent-surface) text-(--accent-primary) dark:bg-(--accent-primary-active)/20 dark:text-(--accent-primary-hover)",
    leave:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
    system: "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400",
  };

  return (
    <div className={cn("w-full flex flex-col gap-4 select-none", className)}>
      {items.map((item, idx) => {
        const Icon = domainIcons[item.domain] || AlertCircle;
        const colorClass = domainColors[item.domain] || "bg-(--bg-page-alt)";

        return (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-md border border-(--border-default) bg-paper dark:bg-(--bg-card) dark:border-(--bg-card-raised) text-start shadow-sm">
            {/* Domain Icon */}
            <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-xs text-(--text-primary) truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-(--text-muted) font-mono font-medium shrink-0">
                  {item.timestamp}
                </span>
              </div>
              {item.description && (
                <span className="text-xs text-(--text-secondary) mt-1 leading-relaxed">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
