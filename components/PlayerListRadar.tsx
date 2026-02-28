"use client"

import React, { useMemo } from "react"
import { usePlayers } from "@/hooks/usePlayers"
import { Info } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBadges } from "@/hooks/useBadges"
import { PlayerBadge } from "./PlayerBadge"

export default function PlayerListRadar({ targetCi }: { targetCi: string }) {
  const { players, loading, error } = usePlayers()
  const { getBadgesForPlayer } = useBadges()
  const router = useRouter()

  const radarData = useMemo(() => {
    if (!players.length || !targetCi) return null

    // Players are already sorted by aura descending in usePlayers
    const targetIndex = players.findIndex(p => p.ci === targetCi)
    
    if (targetIndex === -1) return null

    // Get 2 players above and 2 players below
    const start = Math.max(0, targetIndex - 2)
    const end = Math.min(players.length, targetIndex + 3)
    
    const slice = players.slice(start, end).map((p, idx) => ({
      ...p,
      trueRank: start + idx + 1,
      isTarget: p.ci === targetCi
    }))

    return { slice, targetRank: targetIndex + 1 }
  }, [players, targetCi])

  if (loading) {
     return <div className="h-40 bg-slate-800/30 rounded-xl animate-pulse"></div>
  }

  if (error || !radarData) {
     return <p className="text-slate-400 text-sm py-4">No se pudo cargar el radar.</p>
  }

  return (
    <div>
      <div className="space-y-3">
        {radarData.slice.map((p) => {
          const rank = p.trueRank - 1 // 0-indexed for gradients
          const firstName = p.first_name?.trim().split(/\s+/)[0] ?? ""
          const lastName = p.last_name?.trim().split(/\s+/)[0] ?? ""
          
          const rankGradients: { [key: number]: string } = {
            0: "bg-gradient-to-r from-[#FFD700] to-[#FFECB3]", // Gold
            1: "bg-gradient-to-r from-[#C0C0C0] to-[#E0E0E0]", // Silver
            2: "bg-gradient-to-r from-[#CD7F32] to-[#FFAB73]", // Bronze
          }
          const rankNameColors: { [key: number]: string } = {
            0: "text-amber-900",
            1: "text-slate-900",
            2: "text-orange-950",
          }
          const rankDetailsColors: { [key: number]: string } = {
            0: "text-amber-800",
            1: "text-slate-700",
            2: "text-orange-900",
          }
          const rankBorders: { [key: number]: string } = {
             0: "border-amber-200",
             1: "border-slate-200",
             2: "border-orange-200",
          }
          
          let backgroundClass = rankGradients[rank] || "bg-gradient-to-r from-[#4D2067] to-[#560485]"
          let nameColorClass = rankNameColors[rank] || "text-white"
          let detailsColorClass = rankDetailsColors[rank] || "text-slate-400"
          let borderClass = rankBorders[rank] || "border-violet-900"

          const isTargetHighlight = p.isTarget
          const targetGlow = isTargetHighlight ? "ring-2 ring-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] z-10 scale-[1.02]" : ""

          const badges = getBadgesForPlayer(p.ci, []).filter((b: any) => b.type !== 'novato')

          return (
            <div
              key={p.ci}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/players/detail?ci=${p.ci}`)}
              className={`flex items-center p-3 rounded-lg border ${borderClass} ${backgroundClass} cursor-pointer hover:opacity-95 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 animate-fade-in ${targetGlow}`}
            >
              <div className="flex items-center justify-between w-full relative">
                {isTargetHighlight && (
                   <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-yellow-400 rounded-r-md"></div>
                )}
                
                {/* Left side - Avatar and player info */}
                <div className="flex items-center gap-4 sm:gap-12 flex-1">
                  <Image
                    src={p.avatar || "/placeholder.svg"}
                    alt={`${firstName} ${lastName}`.trim()}
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10 min-w-[40px]"
                    unoptimized
                  />
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold flex items-center gap-2 ${nameColorClass}`}>
                         {`${firstName} ${lastName}`.trim()}
                         {isTargetHighlight && <span className="text-[10px] bg-yellow-500 text-amber-950 px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold">Tú</span>}
                      </p>
                      {badges.length > 0 && (
                        <div className="flex gap-1">
                          {badges.map(badge => (
                            <PlayerBadge key={badge.id} badge={badge} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs ${detailsColorClass}`}>{p.career_name}</p>
                  </div>
                </div>

                {/* Right side - Rank and aura */}
                <div className="text-right">
                  <p className={`font-semibold ${nameColorClass}`}>Rank: {rank + 1}</p>
                  <p className={`text-xs ${detailsColorClass}`}>Aura: {p.aura}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 flex items-start gap-2 text-xs text-slate-500 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p>La <strong>Zona de Guerra</strong> te muestra a tus rivales más cercanos. ¡Gana partidos oficiales para robarles puntos de Elo y subir de posición!</p>
      </div>
    </div>
  )
}
