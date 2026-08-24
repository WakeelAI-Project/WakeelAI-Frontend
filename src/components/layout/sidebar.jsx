import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router";
import {
  Building2,
  Calendar,
  ChevronDown,
  FileText,
  FolderOpen,
  History,
  Landmark,
  Layers,
  MessageSquareCode,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { WakeelLogo } from "../brand/wakeel-logo";
import { useTranslation } from "react-i18next";

export const NAV_ITEMS = [
  { id: "dashboard", labelKey: "sidebar.dashboard", icon: Building2 },
  { id: "company-profile", labelKey: "sidebar.companyProfile", icon: Landmark },
  { id: "departments", labelKey: "sidebar.departments", icon: Layers },
  { id: "hr-team", labelKey: "sidebar.hrTeam", icon: Users },
  { id: "profile", labelKey: "sidebar.myProfile", icon: UserRound },
  { id: "employees", labelKey: "sidebar.employees", icon: Users },
  { id: "leave", labelKey: "sidebar.leave", icon: Calendar },
  { id: "documents", labelKey: "sidebar.documents", icon: FolderOpen },
  { id: "templates", labelKey: "sidebar.templates", icon: FileText },
  { id: "assistant", labelKey: "sidebar.assistant", icon: MessageSquareCode },
  { id: "audit", labelKey: "sidebar.audit", icon: History },
];

const HR_VISIBLE_IDS = [
  "dashboard",
  "employees",
  "leave",
  "documents",
  "templates",
  "departments",
  "assistant",
  "company-profile",
  "profile",
];

export function Sidebar({
  activeId,
  onNavSelect,
  companyName = "الشركة المصرية للمقاولات",
  onCompanySwitch,
  userRole,
  rolePrefix = "",
  className,
}) {
  const { t } = useTranslation();
  const isHrManager = userRole?.toLowerCase() === "hr_manager";

  // Filter visible items based on role
  const visibleItems =
    rolePrefix === "/owner"
      ? NAV_ITEMS.filter((item) =>
          [
            "dashboard",
            "audit",
            "company-profile",
            "departments",
            "hr-team",
            "leave",
          ].includes(item.id),
        )
      : NAV_ITEMS.filter(
          (item) =>
            HR_VISIBLE_IDS.includes(item.id) &&
            (item.id !== "templates" || isHrManager),
        );

  return (
    <aside
      className={cn(
        "flex h-dvh w-60 shrink-0 flex-col justify-between border-e border-(--brand-primary-hover) bg-(--bg-sidebar) text-(--text-on-brand) select-none xl:w-66",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-(--brand-primary-hover) p-5 sm:p-6">
        <WakeelLogo framed className="h-9 w-9 p-1.5" />
        <div className="flex min-w-0 flex-col text-start leading-none">
          <span className="truncate font-display text-lg font-semibold tracking-wide">
            {t("common.appName")}
          </span>
          <span className="mt-0.5 truncate text-[10px] text-(--text-muted)">
            {t("common.subTitle")}
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {visibleItems.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={`${rolePrefix}/${item.id}`}
              onClick={() => onNavSelect?.(item.id)}
              className={cn(
                "relative z-0 flex w-full items-center gap-3 overflow-hidden rounded-sm px-3 py-2.5 text-start text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper select-none cursor-pointer",
                isActive
                  ? "text-(--brand-primary)"
                  : "text-(--text-muted) hover:text-paper hover:bg-(--bg-sidebar-hover)",
              )}>
              {isActive && (
                <motion.span
                  layoutId="active-nav-highlight"
                  className="absolute inset-0 z-0 bg-paper rounded-sm"
                  transition={{ duration: 0.16 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5 shrink-0" />
              <span className="relative z-10 min-w-0 truncate">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-(--brand-primary-hover) shrink-0">
        <button
          onClick={onCompanySwitch}
          className="flex w-full items-center justify-between rounded-sm p-2 text-start transition-colors hover:bg-(--bg-sidebar-hover) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper cursor-pointer">
          <div className="flex min-w-0 items-center gap-3">
            <Building2 className="h-5 w-5 text-(--text-muted) shrink-0" />
            <div className="flex min-w-0 max-w-32.5 flex-col overflow-hidden xl:max-w-37.5">
              <span className="text-xs font-semibold truncate text-(--text-on-brand)">
                {companyName}
              </span>
              <span className="text-[10px] text-(--text-muted)">
                {t("common.activeAccount")}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-(--text-muted) shrink-0" />
        </button>
      </div>
    </aside>
  );
}
