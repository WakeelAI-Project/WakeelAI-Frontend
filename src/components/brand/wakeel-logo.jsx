import React from "react"
import { cn } from "../../lib/utils"

export const WAKEEL_LOGO_SRC = "/wakeel-logo.svg"

export function WakeelLogo({
  alt = "",
  className,
  framed = false,
  imageClassName,
  ...props
}) {
  return (
    <span
      aria-hidden={alt ? undefined : "true"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        framed &&
          "rounded-sm border border-(--brand-primary-hover) bg-(--text-on-brand) shadow-(--shadow-1)",
        className,
      )}
      {...props}
    >
      <img
        alt={alt}
        className={cn("h-full w-full object-contain", imageClassName)}
        draggable="false"
        src={WAKEEL_LOGO_SRC}
      />
    </span>
  )
}
