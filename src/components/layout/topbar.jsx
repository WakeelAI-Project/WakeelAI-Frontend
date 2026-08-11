import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  ToggleLeft,
  ToggleRight,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useTheme } from "../providers/theme-provider";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useLocale } from "../../hooks/use-locale";
import { useAuth } from "../../features/auth/hooks/use-auth";
import { NAV_ITEMS } from "./sidebar";

export function Topbar({
  activeId,
  onSearchClick,
  onAssistantToggle,
  notificationsCount = 3,
  userInitials = "MH",
  onLogout,
  rolePrefix = "/hr",
}) {
  const { theme, toggleTheme, contrast, toggleContrast } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const { currentUser } = useAuth();

  // Check if current user is Owner (hide My Profile for owners)
  const isOwner = currentUser?.role?.toLowerCase().includes("owner");

  const handleLogout = async () => {
    await onLogout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeItem =
    NAV_ITEMS.find((item) => item.id === activeId) || NAV_ITEMS[0];

  return (
    <header className="h-16 w-full bg-(--bg-card) border-b border-(--border-default) px-6 flex items-center justify-between shrink-0">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="font-display text-lg font-semibold text-(--text-primary) truncate">
          {t(activeItem.labelKey)}
        </h1>
      </div>

      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-3 h-10 rounded-sm border border-(--border-default) bg-(--bg-card-subtle) hover:bg-(--bg-card-raised) text-sm text-(--text-muted) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--border-focus) cursor-pointer text-start">
          <span className="flex min-w-0 items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">{t("topbar.searchPrompt")}</span>
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
          className="h-8 px-2 flex items-center gap-1.5 text-xs cursor-pointer"
          title={t("topbar.toggleContrast")}>
          {contrast === "high" ? (
            <ToggleRight className="h-5 w-5 text-(--ai-primary)" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
          <span className="hidden sm:inline">{t("topbar.highContrast")}</span>
        </Button>

        <Button
          variant="ghost"
          size="xs"
          onClick={toggleTheme}
          className="h-8 w-8 p-0 cursor-pointer"
          title={t("topbar.toggleTheme")}>
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {onAssistantToggle && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onAssistantToggle}
            className="h-8 w-8 p-0 text-(--ai-primary) hover:text-(--accent-primary-active) hover:bg-(--ai-surface) cursor-pointer"
            title={t("topbar.aiAssistant")}>
            <Sparkles className="h-4 w-4" />
          </Button>
        )}

        <div className="relative">
          <Button
            variant="ghost"
            size="xs"
            className="h-8 w-8 p-0 cursor-pointer"
            title={t("topbar.notifications")}>
            <Bell className="h-4 w-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-(--status-error-fg)" />
            )}
          </Button>
        </div>

        <div className="w-px h-5 bg-(--border-default) hidden sm:block" />

        <div className="relative" ref={menuRef}>
          <Avatar
            className="h-8 w-8 cursor-pointer select-none ring-offset-2 ring-blue-500 hover:ring-2 transition-all"
            onClick={() => setShowMenu(!showMenu)}>
            <AvatarImage src="" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>

          {showMenu && (
            <div
              className={`absolute ${isRtl ? "left-0" : "right-0"} mt-2 w-48 rounded-sm border border-(--border-default) bg-(--bg-card) p-1 shadow-md z-50`}>
              {!isOwner && (
                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate(`${rolePrefix}/profile`)
                  }}
                  className="w-full text-start px-3 py-2 text-sm text-(--text-primary) hover:bg-(--bg-card-subtle) rounded-sm transition-colors cursor-pointer flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("topbar.myProfile", { defaultValue: "My Profile" })}
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false)
                  navigate(`${rolePrefix}/account-settings`)
                }}
                className="w-full text-start px-3 py-2 text-sm text-(--text-primary) hover:bg-(--bg-card-subtle) rounded-sm transition-colors cursor-pointer flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("topbar.accountSettingsMenu", { defaultValue: "Account Settings" })}
              </button>
              <div className="my-1 border-t border-(--border-default)" />
              <button
                onClick={handleLogout}
                className="w-full text-start px-3 py-2 text-sm text-(--status-error-fg) hover:bg-(--bg-card-subtle) rounded-sm transition-colors cursor-pointer">
                {t("topbar.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
