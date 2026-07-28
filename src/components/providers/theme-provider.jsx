import React, { createContext, useContext, useEffect, useState } from "react"
import { useLocale } from "../../hooks/use-locale"

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("wakeel-theme") || "light"
  })
  const [contrast, setContrastState] = useState(() => {
    return localStorage.getItem("wakeel-contrast") || "normal"
  })

  // Read direction dynamically from centralized i18n hook locale status
  const { direction, changeLanguage } = useLocale()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", theme)
    localStorage.setItem("wakeel-theme", theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-contrast", contrast)
    localStorage.setItem("wakeel-contrast", contrast)
  }, [contrast])

  const setTheme = (t) => setThemeState(t)
  const setContrast = (c) => setContrastState(c)
  
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")
  const toggleContrast = () => setContrast(contrast === "normal" ? "high" : "normal")
  const toggleDirection = () => {
    changeLanguage(direction === "rtl" ? "en" : "ar")
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        contrast,
        direction,
        setTheme,
        setContrast,
        toggleTheme,
        toggleContrast,
        toggleDirection,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
