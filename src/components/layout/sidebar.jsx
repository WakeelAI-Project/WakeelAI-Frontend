import React from "react"
import { motion } from "framer-motion"
import { NavLink } from "react-router"
import {
  Building2,
  Calendar,
  ChevronDown,
  FileText,
  FolderOpen,
  History,
  Landmark,
  MessageSquareCode,
  ShieldCheck,
  UserRound,
  Users
} from "lucide-react"
import { cn } from "../../lib/utils"
import { SealMark } from "../brand/seal-mark"
import { useTranslation } from "react-i18next"
import { useLocale } from "../../hooks/use-locale"

export const NAV_ITEMS = [
  { id: "dashboard", labelKey: "sidebar.dashboard", icon: Building2 },
  { id: "company-profile", labelKey: "sidebar.companyProfile", icon: Landmark },
  { id: "profile", labelKey: "sidebar.myProfile", icon: UserRound },
  { id: "employees", labelKey: "sidebar.employees", icon: Users },
  { id: "contracts", labelKey: "sidebar.contracts", icon: FileText },
  { id: "leave", labelKey: "sidebar.leave", icon: Calendar },
  { id: "compliance", labelKey: "sidebar.compliance", icon: ShieldCheck },
  { id: "documents", labelKey: "sidebar.documents", icon: FolderOpen },
  { id: "assistant", labelKey: "sidebar.assistant", icon: MessageSquareCode },
  { id: "audit", labelKey: "sidebar.audit", icon: History }
]

export function Sidebar({
  activeId,
  onNavSelect,
  companyName = "الشركة المصرية للمقاولات",
  onCompanySwitch,
  rolePrefix = ""
}) {
  const { t } = useTranslation()
  const { isRtl } = useLocale()
  const visibleItems = rolePrefix === "/owner"
    ? NAV_ITEMS.filter((item) =>
        ["dashboard", "company-profile", "profile"].includes(item.id)
      )
    : NAV_ITEMS

  return (
    <aside className="w-60 xl:w-66 h-screen bg-(--bg-sidebar) text-(--text-on-brand) flex flex-col justify-between select-none border-e border-(--brand-primary-hover) shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-(--brand-primary-hover)">
        <SealMark className="shrink-0" />
        <div className="flex flex-col text-start leading-none">
          <span className="font-display text-lg font-semibold tracking-wide">{t("common.appName")}</span>
          <span className="text-[10px] text-(--text-muted) mt-0.5">
            {t("common.subTitle")}
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {visibleItems.map((item) => {
          const isActive = item.id === activeId
          const Icon = item.icon

          return (
            <NavLink
              key={item.id}
              to={`${rolePrefix}/${item.id}`}
              onClick={() => onNavSelect?.(item.id)}
              className={cn(
                "relative z-0 w-full flex items-center gap-3 overflow-hidden px-3 py-2.5 rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper select-none text-start cursor-pointer",
                isActive
                  ? "text-(--brand-primary)"
                  : "text-(--text-muted) hover:text-paper hover:bg-(--bg-sidebar-hover)"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-nav-highlight"
                  className="absolute inset-0 z-0 bg-paper rounded-sm"
                  transition={{ duration: 0.16 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5 shrink-0" />
              <span className="relative z-10">{t(item.labelKey)}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-(--brand-primary-hover) shrink-0">
        <button
          onClick={onCompanySwitch}
          className="w-full flex items-center justify-between p-2 rounded-sm hover:bg-(--bg-sidebar-hover) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper text-start cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-(--text-muted) shrink-0" />
            <div className="flex flex-col overflow-hidden max-w-32.5 xl:max-w-37.5">
              <span className="text-xs font-semibold truncate text-paper">
                {companyName}
              </span>
              <span className="text-[10px] text-(--text-muted)">{t("common.activeAccount")}</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-(--text-muted) shrink-0" />
        </button>
      </div>
    </aside>
  )
}
