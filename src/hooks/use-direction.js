import { useEffect, useState } from "react"

export function useDirection() {
  const [dir, setDir] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("dir") || "rtl"
    }
    return "rtl"
  })

  useEffect(() => {
    if (typeof document === "undefined") return

    const observer = new MutationObserver(() => {
      const currentDir = document.documentElement.getAttribute("dir") || "rtl"
      setDir(currentDir)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    })

    return () => observer.disconnect()
  }, [])

  const setDirection = (newDir) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", newDir)
      document.documentElement.lang = newDir === "rtl" ? "ar" : "en"
    }
    setDir(newDir)
  }

  const toggleDirection = () => {
    setDirection(dir === "rtl" ? "ltr" : "rtl")
  }

  return {
    dir,
    isRtl: dir === "rtl",
    setDirection,
    toggleDirection,
  }
}
