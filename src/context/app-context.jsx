import React, { createContext, useContext, useMemo, useState } from "react"

const AppContext = createContext(undefined)

const currentUser = {
  id: "mona-hassan",
  name: "منى حسن",
  nameEn: "Mona Hassan",
  initials: "MH",
  role: "HR & Compliance Lead"
}

const notifications = [
  { id: "n-1", type: "warning", message: "Contract review due today" },
  { id: "n-2", type: "ai", message: "AI draft has two citations ready" },
  { id: "n-3", type: "info", message: "Payroll audit exported" }
]

export function AppProvider({ children }) {
  const [activeCompany, setActiveCompany] = useState({
    id: "eg-contracting",
    name: "الشركة المصرية للمقاولات",
    nameEn: "Egyptian Contracting Co."
  })

  const value = useMemo(
    () => ({
      activeCompany,
      setActiveCompany,
      currentUser,
      notifications
    }),
    [activeCompany]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
