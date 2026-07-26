import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("wakeel-theme") || "dark"
  })
  const [contrast, setContrastState] = useState(() => {
    return localStorage.getItem("wakeel-contrast") || "normal"
  })
  const [direction, setDirectionState] = useState(() => {
    return localStorage.getItem("wakeel-direction") || "rtl"
  })

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

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("dir", direction)
    root.lang = direction === "rtl" ? "ar" : "en"
    localStorage.setItem("wakeel-direction", direction)
  }, [direction])

  const setTheme = (t) => setThemeState(t)
  const setContrast = (c) => setContrastState(c)
  const setDirection = (d) => setDirectionState(d)

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")
  const toggleContrast = () => setContrast(contrast === "normal" ? "high" : "normal")
  const toggleDirection = () => setDirection(direction === "rtl" ? "ltr" : "rtl")

  return (
    <ThemeContext.Provider
      value={{
        theme,
        contrast,
        direction,
        setTheme,
        setContrast,
        setDirection,
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
