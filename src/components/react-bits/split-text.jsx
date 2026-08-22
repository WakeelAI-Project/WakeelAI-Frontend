import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "../../lib/utils"

const motionTags = {
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
  span: motion.span,
}

function splitIntoParts(text, splitType) {
  if (splitType === "lines") {
    return text.split(/(\n)/)
  }

  return text.split(/(\s+)/)
}

export function SplitText({
  text,
  className,
  delay = 0.045,
  duration = 0.52,
  splitType = "words",
  textAlign = "start",
  tag = "span",
}) {
  const shouldReduceMotion = useReducedMotion()
  const Tag = tag
  const MotionTag = motionTags[tag] || motion.span

  if (shouldReduceMotion) {
    return (
      <Tag className={className} style={{ textAlign }}>
        {text}
      </Tag>
    )
  }

  const parts = splitIntoParts(text, splitType).map((part, index, allParts) => {
    const isStatic = part === "\n" || /^\s+$/.test(part)
    const itemIndex = isStatic
      ? null
      : allParts
          .slice(0, index)
          .filter((candidate) => candidate !== "\n" && !/^\s+$/.test(candidate))
          .length

    return { itemIndex, part, sourceIndex: index }
  })

  return (
    <MotionTag
      aria-label={text}
      className={cn("inline-block whitespace-normal", className)}
      style={{ textAlign }}
    >
      <span aria-hidden="true">
        {parts.map(({ itemIndex, part, sourceIndex }) => {
          if (part === "\n") {
            return <br key={`line-${sourceIndex}`} />
          }

          if (/^\s+$/.test(part)) {
            return part
          }

          return (
            <span
              className="inline-block overflow-hidden align-baseline"
              key={`${part}-${sourceIndex}`}
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: "0.78em" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: itemIndex * delay,
                  duration,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {part}
              </motion.span>
            </span>
          )
        })}
      </span>
    </MotionTag>
  )
}
