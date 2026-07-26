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
  MessageSquareCode,
  ShieldCheck,
  Users
} from "lucide-react"
import { cn } from "../../lib/utils"
import { SealMark } from "../brand/seal-mark"

export const NAV_ITEMS = [
  { id: "employees", label: "Employees", labelAr: "الموظفون", icon: Users },
  { id: "contracts", label: "Contracts", labelAr: "العقود", icon: FileText },
  { id: "leave", label: "Leave", labelAr: "الإجازات", icon: Calendar },
  { id: "compliance", label: "Compliance", labelAr: "الامتثال", icon: ShieldCheck },
  { id: "documents", label: "Documents", labelAr: "المستندات", icon: FolderOpen },
  { id: "assistant", label: "AI Assistant", labelAr: "المساعد الذكي", icon: MessageSquareCode },
  { id: "audit", label: "Audit Log", labelAr: "سجل التدقيق", icon: History }
]

export function Sidebar({
  activeId,
  onNavSelect,
  isRtl = true,
  companyName = "الشركة المصرية للمقاولات",
  onCompanySwitch
}) {
  return (
    <aside className="w-[240px] xl:w-[264px] h-screen bg-[var(--bg-sidebar)] text-[var(--text-on-brand)] flex flex-col justify-between select-none border-e border-[var(--brand-primary-hover)] shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-[var(--brand-primary-hover)]">
        <SealMark className="shrink-0" />
        <div className="flex flex-col text-start leading-none">
          <span className="font-display text-lg font-semibold tracking-wide">Wakeel AI</span>
          <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
            وكيل الذكاء الاصطناعي
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId
          const Icon = item.icon

          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              onClick={() => onNavSelect?.(item.id)}
              className={cn(
                "relative z-0 w-full flex items-center gap-3 overflow-hidden px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-paper)] select-none text-start cursor-pointer",
                isActive
                  ? "text-[var(--brand-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--color-paper)] hover:bg-[var(--bg-sidebar-hover)]"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-nav-highlight"
                  className="absolute inset-0 z-0 bg-[var(--color-paper)] rounded-[var(--radius-sm)]"
                  transition={{ duration: 0.16 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5 shrink-0" />
              <span className="relative z-10">{isRtl ? item.labelAr : item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[var(--brand-primary-hover)] shrink-0">
        <button
          onClick={onCompanySwitch}
          className="w-full flex items-center justify-between p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-sidebar-hover)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-paper)] text-start cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[var(--text-muted)] shrink-0" />
            <div className="flex flex-col overflow-hidden max-w-[130px] xl:max-w-[150px]">
              <span className="text-xs font-semibold truncate text-[var(--color-paper)]">
                {companyName}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">حساب مفعل</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
        </button>
      </div>
    </aside>
  )
}
