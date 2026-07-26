import React from "react"
import { motion } from "framer-motion"
import {
  Users,
  FileText,
  Calendar,
  ShieldCheck,
  FolderOpen,
  MessageSquareCode,
  History,
  Building2,
  ChevronDown
} from "lucide-react"
import { cn } from "../../lib/utils"

const NAV_ITEMS = [
  { id: "employees", label: "Employees", labelAr: "الموظفون", icon: Users },
  { id: "contracts", label: "Contracts", labelAr: "العقود", icon: FileText },
  { id: "leave", label: "Leave", labelAr: "الإجازات", icon: Calendar },
  { id: "compliance", label: "Compliance", labelAr: "الامتثال", icon: ShieldCheck },
  { id: "documents", label: "Documents", labelAr: "المستندات", icon: FolderOpen },
  { id: "assistant", label: "AI Assistant", labelAr: "المساعد الذكي", icon: MessageSquareCode },
  { id: "audit", label: "Audit Log", labelAr: "سجل التدقيق", icon: History },
]

export function Sidebar({
  activeId,
  onNavSelect,
  isRtl = true,
  companyName = "الشركة المصرية للمقاولات",
  onCompanySwitch
}) {
  return (
    <aside className="w-[240px] xl:w-[264px] h-screen bg-[var(--bark-500)] text-[var(--stone-0)] flex flex-col justify-between select-none border-e border-[var(--bark-600)] shrink-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[var(--bark-600)]">
        {/* Seal mark */}
        <div className="w-8 h-8 rounded-full border-2 border-[var(--stone-0)] border-t-transparent border-r-transparent flex items-center justify-center rotate-45 select-none shrink-0" />
        <div className="flex flex-col text-start leading-none">
          <span className="font-semibold text-lg tracking-wide">Wakeel AI</span>
          <span className="text-[10px] text-[var(--stone-300)] mt-0.5">وكيل الذكاء الاصطناعي</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onNavSelect(item.id)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--stone-0)] select-none text-start cursor-pointer",
                isActive
                  ? "text-[var(--bark-500)]"
                  : "text-[var(--stone-300)] hover:text-[var(--stone-0)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-highlight"
                  className="absolute inset-0 bg-[var(--stone-0)] rounded-[var(--radius-sm)] -z-10 dark:bg-[var(--stone-50)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              <span>{isRtl ? item.labelAr : item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Company Switcher */}
      <div className="p-4 border-t border-[var(--bark-600)] shrink-0">
        <button
          onClick={onCompanySwitch}
          className="w-full flex items-center justify-between p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bark-600)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--stone-0)] text-start cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[var(--stone-300)] shrink-0" />
            <div className="flex flex-col overflow-hidden max-w-[130px] xl:max-w-[150px]">
              <span className="text-xs font-semibold truncate text-[var(--stone-0)]">
                {companyName}
              </span>
              <span className="text-[10px] text-[var(--stone-300)]">حساب مفعل</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-[var(--stone-300)] shrink-0" />
        </button>
      </div>
    </aside>
  )
}
