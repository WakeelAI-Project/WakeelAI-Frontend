import React, { createContext, useContext, useMemo, useState, useCallback } from "react"

const AppContext = createContext(undefined)

const currentUser = {
  id: null,
  name: "",
  nameEn: "",
  role: ""
}

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
      currentUser
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
