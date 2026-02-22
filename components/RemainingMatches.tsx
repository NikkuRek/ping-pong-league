"use client"

import React from "react"
import { usePlayerRemainingMatches } from "@/hooks/usePlayerRemainingMatches"
import { Skeleton } from "@/components/ui/skeleton"

const getRingColor = (remaining: number, max: number) => {
  const pct = remaining / max
  if (pct > 0.5) return { ring: "text-emerald-400", label: "text-emerald-400" }
  if (pct > 0.2) return { ring: "text-amber-400", label: "text-amber-400" }
  return { ring: "text-red-400", label: "text-red-400" }
}

export default function RemainingMatches({ ci }: { ci: string }) {
  const { played, remaining, max, loading, error } = usePlayerRemainingMatches(ci)

  if (loading) {
    return <Skeleton className="h-16 w-20 rounded-xl" />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-xs text-slate-500 leading-tight">Rankeds<br />Restantes</p>
        <span className="text-xl font-bold text-slate-400">—</span>
      </div>
    )
  }

  const { ring, label } = getRingColor(remaining, max)

  // SVG ring parameters
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filled = ((max - remaining) / max) * circumference

  return (
    <div
      className="flex flex-col items-center gap-0.5"
      title={`${played} partido${played !== 1 ? "s" : ""} jugado${played !== 1 ? "s" : ""} esta semana`}
    >
      {/* Circular progress */}
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          {/* Track */}
          <circle
            cx="24" cy="24" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-700"
          />
          {/* Progress */}
          <circle
            cx="24" cy="24" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - filled}
            className={`${ring} transition-all duration-700`}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold leading-none ${label}`}>{remaining}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-center leading-tight">
        Rankeds<br />Restantes
      </p>
    </div>
  )
}
