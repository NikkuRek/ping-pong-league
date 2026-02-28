"use client"

import React, { useMemo } from "react"
import { useAllMatches } from "@/hooks/useAllMatches"
import { Flame, Trophy, Activity, MessageSquare } from "lucide-react"

export default function ActivityFeed() {
  const { allMatches, loading, error } = useAllMatches()

  // Generate a dynamic "feed" based on the most recent matches
  const feedItems = useMemo(() => {
    if (!allMatches || allMatches.length === 0) return []

    // Take only the last 5 finished matches to simulate activity
    const recentFinished = allMatches
      .filter(m => m.status === "Finalizado")
      .sort((a,b) => new Date(b.matchDatetime).getTime() - new Date(a.matchDatetime).getTime())
      .slice(0, 5)

    return recentFinished.map((match, idx) => {
       const p1Won = match.score1 > match.score2
       const winnerName = p1Won ? match.player1Name : match.player2Name
       const loserName = p1Won ? match.player2Name : match.player1Name

       // Create some visual variation based on array index
       const variant = idx % 3

       let icon, title, description, colorClass

       if (variant === 0) {
          icon = <Flame className="w-5 h-5 text-orange-500" />
          colorClass = "bg-orange-500/10 border-orange-500/20"
          title = "¡Partidazo reciente!"
          if (match.tournamentName === "Ranked") {
            description = `${winnerName} derrotó a ${loserName} en una partida Clasificatoria`
          } else if (match.tournamentName !== "Amistoso") {
            description = `${winnerName} derrotó a ${loserName} en el torneo ${match.tournamentName}.`
          }
       } else if (variant === 1) {
          icon = <Trophy className="w-5 h-5 text-yellow-500" />
          colorClass = "bg-yellow-500/10 border-yellow-500/20"
          title = "Suma de Elo"
          description = `${winnerName} está subiendo posiciones tras vencer a ${loserName}.`
       } else {
          icon = <MessageSquare className="w-5 h-5 text-purple-500" />
          colorClass = "bg-purple-500/10 border-purple-500/20"
          title = "Actualización de LPP"
          description = `${match.tournamentName} dejó un duelo interesante: ${winnerName} se impuso sobre ${loserName}.`
       }

       return {
          id: match.id,
          icon,
          colorClass,
          title,
          description,
          timeAgo: match.timeAgo
       }
    })

  }, [allMatches])

  if (loading) {
    return (
       <div className="bg-[#1E1E2E]/60 rounded-2xl p-6 border border-slate-700/50 min-h-[300px] animate-pulse"></div>
    )
  }

  if (error || feedItems.length === 0) return null

  return (
    <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
       <div className="flex items-center gap-3 mb-6 px-2">
           <div className="bg-pink-500/10 p-2.5 rounded-xl border border-pink-500/20 shadow-[0_0_15px_-3px_rgba(236,72,153,0.2)]">
               <Activity className="w-6 h-6 text-pink-500" />
           </div>
           <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
               Muro de Actividad
           </h2>
       </div>

       <div className="bg-[#1E1E2E]/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6 shadow-2xl">
          <div className="space-y-4">
             {feedItems.map((item, index) => (
               <div key={`feed-${item.id}-${index}`} className={`flex gap-4 p-4 rounded-xl border ${item.colorClass} bg-opacity-50 transition-colors hover:bg-opacity-80`}>
                 <div className="mt-1">
                    {item.icon}
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-slate-200">{item.title}</h4>
                       <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider">{item.timeAgo}</span>
                    </div>
                    <p className="text-sm text-slate-400">{item.description}</p>
                 </div>
               </div>
             ))}
          </div>
       </div>
    </section>
  )
}
