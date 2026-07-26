import React from "react"
import { Search, Bell, Moon, Sun, ToggleLeft, ToggleRight, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { useTheme } from "../providers/theme-provider"
import { cn } from "../../lib/utils"

export function Topbar({
  title,
  titleAr,
  isRtl = true,
  onSearchClick,
  onAssistantToggle,
  notificationsCount = 3
}) {
  const { theme, toggleTheme, contrast, toggleContrast } = useTheme()

  return (
    <header className="h-16 w-full bg-[var(--color-paper)] border-b border-[var(--border-default)] px-6 flex items-center justify-between shrink-0 dark:bg-[var(--stone-900)] dark:border-[var(--stone-800)]">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {isRtl ? titleAr : title}
        </h1>
      </div>

      {/* Global Search trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-3 h-10 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--stone-0)] hover:bg-[var(--stone-50)] text-sm text-[var(--stone-400)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-700)] cursor-pointer text-start"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>{isRtl ? "بحث عن موظف، عقد، أو امتثال..." : "Search employee, contract, or compliance..."}</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border-default)] bg-[var(--stone-100)] px-1.5 font-mono text-[10px] font-medium opacity-100 dark:bg-[var(--stone-800)] dark:border-[var(--stone-700)]">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 select-none">
        {/* Contrast Toggle */}
        <Button
          variant="ghost"
          size="xs"
          onClick={toggleContrast}
          className="h-8 px-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title={isRtl ? "تبديل تباين عالي" : "Toggle High Contrast"}
        >
          {contrast === "high" ? (
            <ToggleRight className="h-5 w-5 text-[var(--teal-500)]" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
          <span className="hidden sm:inline">{isRtl ? "تباين عالي" : "High Contrast"}</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="xs"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
          title={isRtl ? "تبديل المظهر" : "Toggle Theme"}
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* AI Assistant docked-panel toggle */}
        {onAssistantToggle && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onAssistantToggle}
            className="h-8 w-8 p-0 text-[var(--teal-600)] hover:text-[var(--teal-700)] hover:bg-[var(--teal-50)] dark:text-[var(--teal-400)] dark:hover:bg-[var(--teal-900)]"
            title={isRtl ? "المساعد الذكي" : "AI Assistant"}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        )}

        {/* Notifications Icon */}
        <div className="relative">
          <Button
            variant="ghost"
            size="xs"
            className="h-8 w-8 p-0"
            title={isRtl ? "الإشعارات" : "Notifications"}
          >
            <Bell className="h-4 w-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-[var(--status-error)]" />
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border-default)] dark:bg-[var(--stone-800)] hidden sm:block" />

        {/* Avatar */}
        <Avatar className="h-8 w-8 cursor-pointer select-none">
          <AvatarImage src="" />
          <AvatarFallback>مه</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
