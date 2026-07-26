import React from "react"
import { cn } from "../../lib/utils"

export function ChartsWrapper({
  title,
  type = "bar", // bar, area, donut
  series = [],
  labels = [],
  isRtl: _isRtl = true,
  className
}) {
  // Brand color scheme: Bark (primary series), Teal (secondary series), Ochre (third series), Stone (4th series)
  const chartColors = [
    "var(--brand-primary)", // Bark
    "var(--ai-primary)", // Teal
    "var(--accent-primary)", // Ochre
    "var(--text-muted)", // Stone (4th)
  ]

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-paper)] p-5 flex flex-col gap-4 dark:bg-[var(--bg-card)] dark:border-[var(--bg-card-raised)] text-start shadow-sm select-none",
        className
      )}
    >
      {/* Title & Legend Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </span>
        <div className="flex items-center gap-3">
          {series.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: chartColors[idx % chartColors.length] }}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Plot Area */}
      <div className="h-[200px] w-full flex items-end justify-between gap-4 border-b border-l border-[var(--border-default)] pb-2 ps-2 relative dark:border-[var(--bg-card-raised)]">
        {type === "bar" && (
          <div className="w-full h-full flex items-end justify-around pt-4">
            {labels.map((lbl, lIdx) => (
              <div key={lIdx} className="flex flex-col items-center gap-1 flex-1 max-w-[60px]">
                <div className="w-full flex items-end gap-1 justify-center h-[140px]">
                  {series.map((s, sIdx) => {
                    const val = s.data[lIdx] || 10
                    return (
                      <div
                        key={sIdx}
                        className="w-3 rounded-t-[var(--radius-xs)] transition-all duration-300"
                        style={{
                          height: `${val}%`,
                          backgroundColor: chartColors[sIdx % chartColors.length]
                        }}
                      />
                    )
                  })}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate max-w-full">
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        )}

        {type === "area" && (
          <svg className="w-full h-full pt-4" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Draw Area Curve for Series 1 (primary) */}
            <path
              d="M 0 100 L 0 50 Q 25 20 50 60 T 100 30 L 100 100 Z"
              fill="var(--ai-surface)"
              className="opacity-30"
            />
            <path
              d="M 0 50 Q 25 20 50 60 T 100 30"
              fill="none"
              stroke="var(--ai-primary)"
              strokeWidth="2"
            />
          </svg>
        )}

        {type === "donut" && (
          <div className="absolute inset-0 flex items-center justify-center pt-2">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--bg-page-alt)" strokeWidth="4" />
              {/* Pie slices */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="var(--brand-primary)"
                strokeWidth="4"
                strokeDasharray="60 40"
                strokeDashoffset="0"
              />
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="var(--ai-primary)"
                strokeWidth="4"
                strokeDasharray="25 75"
                strokeDashoffset="-60"
              />
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="var(--accent-primary)"
                strokeWidth="4"
                strokeDasharray="15 85"
                strokeDashoffset="-85"
              />
            </svg>
            <div className="absolute flex flex-col text-center leading-none select-none">
              <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                {series[0]?.data?.[0] || "100%"}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">إجمالي الحالات</span>
            </div>
          </div>
        )}
      </div>

      {/* Optional bottom axis labels for area trend */}
      {type === "area" && labels.length > 0 && (
        <div className="flex justify-between px-2 text-[10px] text-[var(--text-muted)]">
          {labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      )}
    </div>
  )
}
