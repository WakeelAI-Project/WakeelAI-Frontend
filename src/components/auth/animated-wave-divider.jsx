import React from "react"
import { cn } from "../../lib/utils"

/**
 * AnimatedWaveDivider
 * Renders a flowing, multi-layered organic wave boundary between the
 * dark hero section and the login form.
 */
export function AnimatedWaveDivider({ className, isRtl = false }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-y-0 z-20 hidden w-28 sm:w-36 lg:block lg:w-48 xl:w-56 overflow-hidden",
        isRtl ? "start-0 -scale-x-100" : "end-0",
        className
      )}
    >
      <svg
        className="h-full w-full object-fill animate-wave-glow"
        viewBox="0 0 160 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial & Linear Glow Gradients */}
          <linearGradient id="wave-stroke-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#60a5fa" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#2563eb" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="wave-stroke-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="wave-ribbon-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="faint-track-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>

          {/* SVG Glow Filter for neon edge */}
          <filter id="wave-glow" x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.22  0 0 0 0 0.74  0 0 0 0 0.97  0 0 0 1 0"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 0: Form side fill (masks the hero with the form's background color) */}
        <path
          d="M 68,-20 C 118,120 38,260 48,420 C 58,580 152,680 138,840 C 128,920 78,980 72,1020 L 160,1020 L 160,-20 Z"
          className="fill-(--bg-card) transition-colors duration-200"
        />

        {/* Layer 1: Ribbon translucent fill behind the wave */}
        <g className="animate-wave-2">
          <path
            d="M 50,-20 C 100,120 20,260 30,420 C 40,580 134,680 120,840 C 110,920 60,980 54,1020 L 72,1020 C 78,980 128,920 138,840 C 152,680 58,580 48,420 C 38,260 118,120 68,-20 Z"
            fill="url(#wave-ribbon-fill)"
          />
        </g>

        {/* Layer 2: Secondary subtle wave ribbon */}
        <g className="animate-wave-2">
          <path
            d="M 78,-20 C 128,135 48,275 58,435 C 68,595 162,695 148,855 C 138,935 88,995 82,1020"
            fill="none"
            stroke="url(#wave-stroke-grad-2)"
            strokeWidth="1.75"
            strokeDasharray="4 2"
            opacity="0.6"
          />
        </g>

        {/* Layer 3: Main glowing neon wave curve */}
        <g className="animate-wave-1">
          <path
            d="M 68,-20 C 118,120 38,260 48,420 C 58,580 152,680 138,840 C 128,920 78,980 72,1020"
            fill="none"
            stroke="url(#wave-stroke-grad-1)"
            strokeWidth="3.25"
            strokeLinecap="round"
            filter="url(#wave-glow)"
          />
        </g>

        {/* Layer 4: Tertiary delicate highlight curve */}
        <g className="animate-wave-1">
          <path
            d="M 64,-20 C 114,115 34,255 44,415 C 54,575 148,675 134,835 C 124,915 74,975 68,1020"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            opacity="0.4"
          />
        </g>

        {/* Layer 5: AI neural constellation lines & glowing nodes */}
        {/* Faint dotted connecting tracks */}
        <path
          d="M 98,130 Q 120,220 44,325"
          fill="none"
          stroke="url(#faint-track-grad)"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.7"
        />
        <path
          d="M 44,325 Q 70,470 115,610"
          fill="none"
          stroke="url(#faint-track-grad)"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.7"
        />
        <path
          d="M 115,610 Q 165,710 144,775"
          fill="none"
          stroke="url(#faint-track-grad)"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.7"
        />
        <path
          d="M 144,775 Q 125,865 78,945"
          fill="none"
          stroke="url(#faint-track-grad)"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.7"
        />

        {/* Glowing Node Particles */}
        <g className="animate-particle-node" style={{ transformOrigin: "98px 130px", animationDelay: "0s" }}>
          <circle cx="98" cy="130" r="7" fill="#38bdf8" opacity="0.25" />
          <circle cx="98" cy="130" r="4" fill="#38bdf8" opacity="0.6" filter="url(#node-glow)" />
          <circle cx="98" cy="130" r="2.2" fill="#ffffff" />
        </g>

        <g className="animate-particle-node" style={{ transformOrigin: "44px 325px", animationDelay: "1.2s" }}>
          <circle cx="44" cy="325" r="8" fill="#60a5fa" opacity="0.25" />
          <circle cx="44" cy="325" r="4.5" fill="#38bdf8" opacity="0.7" filter="url(#node-glow)" />
          <circle cx="44" cy="325" r="2.5" fill="#ffffff" />
        </g>

        <g className="animate-particle-node" style={{ transformOrigin: "115px 610px", animationDelay: "2.4s" }}>
          <circle cx="115" cy="610" r="7" fill="#38bdf8" opacity="0.25" />
          <circle cx="115" cy="610" r="4" fill="#38bdf8" opacity="0.6" filter="url(#node-glow)" />
          <circle cx="115" cy="610" r="2.2" fill="#ffffff" />
        </g>

        <g className="animate-particle-node" style={{ transformOrigin: "144px 775px", animationDelay: "0.8s" }}>
          <circle cx="144" cy="775" r="9" fill="#60a5fa" opacity="0.3" />
          <circle cx="144" cy="775" r="5" fill="#38bdf8" opacity="0.8" filter="url(#node-glow)" />
          <circle cx="144" cy="775" r="2.8" fill="#ffffff" />
        </g>

        <g className="animate-particle-node" style={{ transformOrigin: "78px 945px", animationDelay: "1.8s" }}>
          <circle cx="78" cy="945" r="6.5" fill="#38bdf8" opacity="0.25" />
          <circle cx="78" cy="945" r="3.8" fill="#38bdf8" opacity="0.6" filter="url(#node-glow)" />
          <circle cx="78" cy="945" r="2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  )
}
