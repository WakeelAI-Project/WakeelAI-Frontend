import React from "react"
import { motion, useReducedMotion } from "framer-motion"

export function AnimatedContent({
  children,
  className,
  distance = 22,
  direction = "vertical",
  reverse = false,
  duration = 0.5,
  delay = 0,
  threshold = 0.18,
  once = true,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion()
  const axis = direction === "horizontal" ? "x" : "y"
  const offset = reverse ? -distance : distance

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, [axis]: offset }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once, amount: threshold }}
      whileInView={{ opacity: 1, [axis]: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

