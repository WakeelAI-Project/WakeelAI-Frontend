import React, { useMemo, useState } from "react"
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation, useNavigate } from "react-router"
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
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute"
import { GuestRoute } from "./features/auth/components/GuestRoute"
import { useAuth } from "./features/auth/hooks/use-auth"

// Wrapper to dynamically inject the active isRtl state from theme provider into pages
function RouteWrapper({ Component }) {
  const { direction } = useTheme()
  const isRtl = direction === "rtl"
  return <Component isRtl={isRtl} />
}

function DashboardShell() {
  const { direction, toggleDirection } = useTheme()
  const { toast } = useToast()
  const { activeCompany, currentUser: defaultUser, notifications } = useApp()
  const { currentUser: authUser, logout } = useAuth()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isRtl = direction === "rtl"

  // Merge dynamic authentication data into user state
  const currentUser = useMemo(() => {
    if (!authUser) return defaultUser
    return {
      id: authUser.sub || defaultUser.id,
      name: authUser.name || defaultUser.name,
      nameEn: authUser.nameEn || defaultUser.nameEn,
      initials: authUser.initials || "MH",
      role: authUser.role || defaultUser.role,
    }
  }, [authUser, defaultUser])

  // Supports parsing nested routes under /hr/ or /owner/
  const pathParts = location.pathname.split("/")
  const activeId = pathParts[2] || pathParts[1] || "employees"
  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeId) || NAV_ITEMS[0],
    [activeId]
  )

  const rolePrefix = currentUser?.role?.toLowerCase().includes("hr") ? "/hr" : "/owner"

  const handleNavSelect = (navId, query) => {
    navigate(`${rolePrefix}/${navId}`)
    if (query) {
      toast({
        type: navId === "assistant" ? "ai" : "info",
        message: navId === "assistant" ? `AI query submitted: ${query}` : `Navigated to: ${navId}`
      })
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-(--bg-page) text-(--text-primary)">
      <Sidebar
        activeId={activeId}
        isRtl={isRtl}
        companyName={isRtl ? activeCompany.name : activeCompany.nameEn}
        onNavSelect={(navId) => navigate(`${rolePrefix}/${navId}`)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={activeItem.label}
          titleAr={activeItem.labelAr}
          isRtl={isRtl}
          onSearchClick={() => setIsCommandOpen(true)}
          onAssistantToggle={() => navigate(`${rolePrefix}/assistant`)}
          notificationsCount={notifications.length}
          userInitials={currentUser.initials}
          onLogout={logout}
        />

        <div className="flex items-center justify-end gap-2 border-b border-(--border-default) bg-(--bg-card-subtle) px-6 py-2">
          <button
            type="button"
            onClick={toggleDirection}
            className="rounded-sm border border-(--border-default) bg-(--bg-card) px-3 py-1.5 text-xs font-semibold text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          >
            {isRtl ? "English layout" : "التخطيط العربي"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
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

// Router configuration using the React Router v7 Data Router API
const router = createBrowserRouter([
  {
    // Guest Routes (restricted if already authenticated)
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <div id="login-placeholder">Login Page Placeholder</div> },
      { path: "/", element: <Navigate to="/login" replace /> }
    ]
  },
  {
    // HR Protected Subtree
    path: "/hr",
    element: <ProtectedRoute allowedRoles={["HR", "HR & Compliance Lead"]} />,
    children: [
      {
        element: <DashboardShell />,
        children: [
          { path: "", element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <RouteWrapper Component={EmployeesPage} /> },
          { path: "employees", element: <RouteWrapper Component={EmployeesPage} /> },
          { path: "contracts", element: <RouteWrapper Component={ContractsPage} /> },
          { path: "leave", element: <RouteWrapper Component={LeavePage} /> },
          { path: "compliance", element: <RouteWrapper Component={CompliancePage} /> },
          { path: "documents", element: <RouteWrapper Component={DocumentsPage} /> },
          { path: "assistant", element: <RouteWrapper Component={AssistantPage} /> },
          { path: "audit", element: <RouteWrapper Component={AuditPage} /> }
        ]
      }
    ]
  },
  {
    // Catch all - redirect back to login
    path: "*",
    element: <Navigate to="/login" replace />
  }
])

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
