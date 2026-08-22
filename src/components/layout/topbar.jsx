import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
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
import { useAuth } from "../../features/auth/hooks/use-auth";
import { NAV_ITEMS } from "./sidebar";

export function Topbar({
  activeId,
  onMenuClick,
  onSearchClick,
  onAssistantToggle,
  userInitials = "MH",
  onLogout,
  rolePrefix = "/hr",
}) {
  const { theme, toggleTheme, contrast, toggleContrast } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const activeItem = NAV_ITEMS.find((item) => item.id === activeId);
  const activeTitle =
    activeItem
      ? t(activeItem.labelKey)
      : activeId === "account-settings"
        ? t("topbar.accountSettingsMenu", { defaultValue: "Account Settings" })
        : t("sidebar.dashboard");

  return (
    <header className="flex min-h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-(--border-default) bg-(--bg-card) px-3 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="h-9 w-9 shrink-0 p-0 lg:hidden"
          aria-label={t("topbar.openNavigation", { defaultValue: "Open navigation" })}
          title={t("topbar.openNavigation", { defaultValue: "Open navigation" })}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
        <h1 className="font-display text-lg font-semibold text-(--text-primary) truncate">
          {activeTitle}
        </h1>
      </div>

      <div className="mx-4 hidden max-w-md flex-1 md:block lg:mx-6">
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

      <div className="flex shrink-0 items-center gap-1.5 select-none sm:gap-2 lg:gap-3">
        <Button
          variant="ghost"
          size="xs"
          onClick={toggleContrast}
          className="h-8 px-2 text-xs cursor-pointer"
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
              className="absolute end-0 z-50 mt-2 w-48 rounded-sm border border-(--border-default) bg-(--bg-card) p-1 shadow-md">
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
