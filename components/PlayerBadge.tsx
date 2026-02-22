"use client"

import React from "react"
import { Badge as BadgeType } from "@/lib/badges"
import { Tooltip } from "@/components/ui/tooltip"
import * as Icons from "lucide-react"

interface PlayerBadgeProps {
  badge: BadgeType
  size?: "sm" | "md"
}

export const PlayerBadge: React.FC<PlayerBadgeProps> = ({ badge, size = "md" }) => {
  const typeStyles = {
    novato: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    champion: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "runner-up": "bg-slate-400/10 text-slate-400 border-slate-400/20",
    milestone: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    performance: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    style: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    foundation: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  }

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2 py-1 text-xs gap-1.5",
  }

  const iconSizes = {
    sm: 10,
    md: 12,
  }

  // Dynamically get the icon component
  const IconComponent = (Icons as any)[badge.icon] || Icons.HelpCircle

  return (
    <Tooltip content={badge.label}>
      <div
        className={`flex items-center border rounded-full font-medium transition-colors hover:bg-opacity-20 ${typeStyles[badge.type]} ${sizes[size]}`}
      >
        <IconComponent size={iconSizes[size]} strokeWidth={2.5} />
        <span>{badge.label}</span>
      </div>
    </Tooltip>
  )
}
