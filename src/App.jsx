import React, { useEffect, useMemo, useState } from "react"
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation, useNavigate } from "react-router"
import { CommandPalette } from "./components/layout/command-palette"
import { Sidebar } from "./components/layout/sidebar"
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
import { LoginPage } from "./pages/auth/login"
import { RegisterPage } from "./pages/auth/register"
import { HrDashboardPage } from "./pages/hr-dashboard"
import { OwnerDashboardPage } from "./pages/owner-dashboard"
import { DepartmentsPage } from "./pages/departments"
import { CompanyProfilePage } from "./pages/company-profile"
import { UserProfilePage } from "./pages/user-profile"
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute"
import { GuestRoute } from "./features/auth/components/GuestRoute"
import { useAuth } from "./features/auth/hooks/use-auth"
import { useAuthStore } from "./features/auth/store/auth-store"
import { configureAuthStore } from "./lib/api"
import { useLocale } from "./hooks/use-locale"
import { useTranslation } from "react-i18next"
import { getCompanyProfile } from "./features/company/services/profile-service"
import "./i18n" // Load i18n configuration

configureAuthStore(useAuthStore.getState)

function DashboardShell() {
  const { toggleDirection } = useTheme()
  const { toast } = useToast()
  const { activeCompany, currentUser: defaultUser, notifications } = useApp()
  const { currentUser: authUser, logout } = useAuth()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isRtl } = useLocale()
  const { t } = useTranslation()

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

  const pathParts = location.pathname.split("/")
  const activeId = pathParts[2] || pathParts[1] || "employees"

  const isHrUser = currentUser?.role?.toLowerCase().includes("hr")
  const rolePrefix = isHrUser ? "/hr" : "/owner"

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
        companyName={(isRtl ? activeCompany?.name : activeCompany?.nameEn) || ""}
        rolePrefix={rolePrefix}
        onNavSelect={(navId) => navigate(`${rolePrefix}/${navId}`)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          activeId={activeId}
          onSearchClick={() => setIsCommandOpen(true)}
          onAssistantToggle={isHrUser ? () => navigate(`${rolePrefix}/assistant`) : undefined}
          notificationsCount={notifications.length}
          userInitials={currentUser.initials}
          onLogout={logout}
        />

        <div className="flex items-center justify-end gap-2 border-b border-(--border-default) bg-(--bg-card-subtle) px-6 py-2">
          <button
            type="button"
            onClick={toggleDirection}
            className="rounded-sm border border-(--border-default) bg-(--bg-card) px-3 py-1.5 text-xs font-semibold text-(--text-secondary) hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            {isRtl ? t("topbar.englishLayout") : t("topbar.arabicLayout")}
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
      />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/", element: <Navigate to="/login" replace /> }
    ]
  },
  {
    path: "/owner",
    element: <ProtectedRoute allowedRoles={["Owner", "Company_Owner"]} />,
    children: [
      {
        element: <DashboardShell />,
        children: [
          { path: "", element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <OwnerDashboardPage /> },
          { path: "company-profile", element: <CompanyProfilePage /> },
          { path: "profile", element: <UserProfilePage /> },
          { path: "departments", element: <DepartmentsPage /> }
        ]
      }
    ]
  },
  {
    path: "/hr",
    element: <ProtectedRoute allowedRoles={["HR", "HR_Manager", "HR & Compliance Lead"]} />,
    children: [
      {
        element: <DashboardShell />,
        children: [
          { path: "", element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <HrDashboardPage /> },
          { path: "employees", element: <EmployeesPage /> },
          { path: "contracts", element: <ContractsPage /> },
          { path: "leave", element: <LeavePage /> },
          { path: "compliance", element: <CompliancePage /> },
          { path: "documents", element: <DocumentsPage /> },
          { path: "assistant", element: <AssistantPage /> },
          { path: "audit", element: <AuditPage /> },
          { path: "company-profile", element: <CompanyProfilePage /> },
          { path: "profile", element: <UserProfilePage /> }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
])

function AuthBootstrap() {
  const { setActiveCompany, clearActiveCompany } = useApp()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    useAuthStore.getState().bootstrapAuth()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      // Covers explicit logout (client-side navigation, no hard reload) as well
      // as a failed silent refresh — never let one user's session data leak
      // into the next login.
      clearActiveCompany()
      return
    }

    getCompanyProfile()
      .then((data) => {
        if (data && data.name) {
          setActiveCompany({
            id: data.id,
            name: data.name,
            nameEn: data.nameEn || data.name,
          })
        }
      })
      .catch((err) => {
        // 403 (HR) or any other failure: leave activeCompany cleared —
        // no fallback/mock data is substituted here.
        console.error("Failed to load company profile on bootstrap:", err)
      })
  }, [isAuthenticated, setActiveCompany, clearActiveCompany])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <AuthBootstrap />
          <RouterProvider router={router} />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}