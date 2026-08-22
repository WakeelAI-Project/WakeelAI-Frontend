import React, { useState } from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "../../lib/utils"

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(184, 147, 91, 0.16)",
}) {
  const shouldReduceMotion = useReducedMotion()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (event) => {
    if (shouldReduceMotion) return

    const rect = event.currentTarget.getBoundingClientRect()
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => !shouldReduceMotion && setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onMouseMove={handleMouseMove}
    >
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 38%)`,
            opacity,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

