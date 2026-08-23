import React, { createContext, useContext, useMemo, useState, useCallback } from "react"

const AppContext = createContext(undefined)

const currentUser = {
  id: null,
  name: "",
  nameEn: "",
  role: ""
}

const notifications = [
  { id: "n-1", type: "warning", message: "Contract review due today" },
  { id: "n-2", type: "ai", message: "AI draft has two citations ready" },
  { id: "n-3", type: "info", message: "Payroll audit exported" }
]

const EMPTY_COMPANY = { id: null, name: "", nameEn: "" }

export function AppProvider({ children }) {
  const [activeCompany, setActiveCompany] = useState(EMPTY_COMPANY)

  const clearActiveCompany = useCallback(() => {
    setActiveCompany(EMPTY_COMPANY)
  }, [])

  const value = useMemo(
    () => ({
      activeCompany,
      setActiveCompany,
      clearActiveCompany,
      currentUser,
      notifications
    }),
    [activeCompany, clearActiveCompany]
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
