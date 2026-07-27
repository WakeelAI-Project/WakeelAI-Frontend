import React from "react"
import { Bell, Moon, Search, Sparkles, Sun, ToggleLeft, ToggleRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { useTheme } from "../providers/theme-provider"

export function Topbar({
  title,
  titleAr,
  isRtl = true,
  onSearchClick,
  onAssistantToggle,
  notificationsCount = 3,
  userInitials = "MH"
}) {
  const { theme, toggleTheme, contrast, toggleContrast } = useTheme()

  return (
    <header className="h-16 w-full bg-(--bg-card) border-b border-(--border-default) px-6 flex items-center justify-between shrink-0">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="font-display text-lg font-semibold text-(--text-primary) truncate">
          {isRtl ? titleAr : title}
        </h1>
      </div>

      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-3 h-10 rounded-sm border border-(--border-default) bg-(--bg-card-subtle) hover:bg-(--bg-card-raised) text-sm text-(--text-muted) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--border-focus) cursor-pointer text-start"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {isRtl ? "بحث عن موظف، عقد، أو امتثال..." : "Search employee, contract, or compliance..."}
            </span>
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-(--border-default) bg-(--bg-page-alt) px-1.5 font-mono text-[10px] font-medium opacity-100">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 select-none">
        <Button
          variant="ghost"
          size="xs"
          onClick={toggleContrast}
          className="h-8 px-2 flex items-center gap-1.5 text-xs"
          title={isRtl ? "تبديل التباين العالي" : "Toggle High Contrast"}
        >
          {contrast === "high" ? (
            <ToggleRight className="h-5 w-5 text-(--ai-primary)" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
          <span className="hidden sm:inline">{isRtl ? "تباين عال" : "High Contrast"}</span>
        </Button>

        <Button
          variant="ghost"
          size="xs"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
          title={isRtl ? "تبديل المظهر" : "Toggle Theme"}
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {onAssistantToggle && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onAssistantToggle}
            className="h-8 w-8 p-0 text-(--ai-primary) hover:text-(--accent-primary-active) hover:bg-(--ai-surface)"
            title={isRtl ? "المساعد الذكي" : "AI Assistant"}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        )}

        <div className="relative">
          <Button
            variant="ghost"
            size="xs"
            className="h-8 w-8 p-0"
            title={isRtl ? "الإشعارات" : "Notifications"}
          >
            <Bell className="h-4 w-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-(--status-error-fg)" />
            )}
          </Button>
        </div>

        <div className="w-px h-5 bg-(--border-default) hidden sm:block" />

        <Avatar className="h-8 w-8 cursor-pointer select-none">
          <AvatarImage src="" />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
