import React, { useMemo, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router"
import { CommandPalette } from "./components/layout/command-palette"
import { Sidebar, NAV_ITEMS } from "./components/layout/sidebar"
import { Topbar } from "./components/layout/topbar"
import { ThemeProvider, useTheme } from "./components/providers/theme-provider"
import { ToastProvider, useToast } from "./components/ui/toast"
import { AppProvider, useApp } from "./context/app-context"
import { AssistantPage } from "./pages/assistant"
import { AuditPage } from "./pages/audit"
import { CompliancePage } from "./pages/compliance"
import { ContractsPage } from "./pages/contracts"
import { DocumentsPage } from "./pages/documents"
import { EmployeesPage } from "./pages/employees"
import { LeavePage } from "./pages/leave"

function DashboardShell() {
  const { direction, toggleDirection } = useTheme()
  const { toast } = useToast()
  const { activeCompany, currentUser, notifications } = useApp()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isRtl = direction === "rtl"

  const activeId = location.pathname.split("/")[1] || "employees"
  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeId) || NAV_ITEMS[0],
    [activeId]
  )

  const handleNavSelect = (navId, query) => {
    navigate(`/${navId}`)
    if (query) {
      toast({
        type: navId === "assistant" ? "ai" : "info",
        message: navId === "assistant" ? `AI query submitted: ${query}` : `Navigated to: ${navId}`
      })
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Sidebar
        activeId={activeId}
        isRtl={isRtl}
        companyName={isRtl ? activeCompany.name : activeCompany.nameEn}
        onNavSelect={(navId) => navigate(`/${navId}`)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={activeItem.label}
          titleAr={activeItem.labelAr}
          isRtl={isRtl}
          onSearchClick={() => setIsCommandOpen(true)}
          onAssistantToggle={() => navigate("/assistant")}
          notificationsCount={notifications.length}
          userInitials={currentUser.initials}
        />

        <div className="flex items-center justify-end gap-2 border-b border-[var(--border-default)] bg-[var(--bg-card-subtle)] px-6 py-2">
          <button
            type="button"
            onClick={toggleDirection}
            className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isRtl ? "English layout" : "التخطيط العربي"}
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeesPage isRtl={isRtl} />} />
          <Route path="/contracts" element={<ContractsPage isRtl={isRtl} />} />
          <Route path="/leave" element={<LeavePage isRtl={isRtl} />} />
          <Route path="/compliance" element={<CompliancePage isRtl={isRtl} />} />
          <Route path="/documents" element={<DocumentsPage isRtl={isRtl} />} />
          <Route path="/assistant" element={<AssistantPage isRtl={isRtl} />} />
          <Route path="/audit" element={<AuditPage isRtl={isRtl} />} />
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </div>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpen={() => setIsCommandOpen(true)}
        onNavSelect={handleNavSelect}
        isRtl={isRtl}
      />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <DashboardShell />
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
