"use client"

import React from "react"
import { useTournaments } from "@/hooks/useTournaments"
import Link from "next/link"
import { Button } from "./ui/button"
import { CalendarDays, Trophy, ChevronRight, Activity } from "lucide-react"

export default function TournamentStatusCards() {
  const { tournaments, loading, error } = useTournaments()

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-800/50 rounded-2xl"></div>
        ))}
      </div>
    )
  }

  if (error || !tournaments.length) return null

  // Sort by priority: Inscripción > En Curso > Finalizado
  const activeTournaments = tournaments.filter(t => t.status !== "Cancelado")
  const sorted = activeTournaments.sort((a, b) => {
    const weights: Record<string, number> = { "Próximo": 3, "En Curso": 2, "Finalizado": 1 }
    return (weights[b.status] || 0) - (weights[a.status] || 0)
  }).slice(0, 3) // Show max 3 cards
  
  if (sorted.length === 0) return null

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
      {sorted.map((t, idx) => {
        let borderColor = "border-slate-700/50"
        let bgGradient = "from-slate-800/40 to-slate-900/40"
        let icon = <Trophy className="w-5 h-5 text-slate-400" />
        let statusBadge = null
        let actionButton = null

        if (t.status === "Próximo") {
          borderColor = "border-green-500/50"
          bgGradient = "from-green-900/20 to-slate-900/40"
          icon = <CalendarDays className="w-6 h-6 text-green-400" />
          statusBadge = <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Inscripciones Abiertas</span>
          actionButton = (
            <Button asChild className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-semibold">
              <Link href={`/tournaments/detail?id=${t.tournament_id}`} className="w-full text-center">
                Inscribirme <ChevronRight className="w-4 h-4 ml-1 inline-flex" />
              </Link>
            </Button>
          )
        } else if (t.status === "En Curso" || t.tournament_id > 2 ) {
          borderColor = "border-yellow-500/50"
          bgGradient = "from-yellow-900/20 to-slate-900/40"
          icon = <Activity className="w-6 h-6 text-yellow-400" />
          statusBadge = <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">En Juego</span>
          actionButton = (
             <Button asChild variant="outline" className="w-full mt-4 border-yellow-500/50 text-yellow-200 hover:bg-yellow-500/10">
              <Link href={`/tournaments/detail?id=${t.tournament_id}`} className="w-full text-center">
                Ver Torneo <ChevronRight className="w-4 h-4 ml-1 inline-flex" />
              </Link>
            </Button>
          )
        } else if (t.status === "Finalizado") {
          borderColor = "border-purple-500/30"
          bgGradient = "from-purple-900/20 to-slate-900/40"
          icon = <Trophy className="w-6 h-6 text-purple-400" />
          statusBadge = <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Completado</span>
          actionButton = (
            <Button asChild variant="ghost" className="w-full mt-4 text-purple-300 hover:text-purple-200 hover:bg-purple-500/10">
              <Link href={`/tournaments/detail?id=${t.tournament_id}`} className="w-full text-center">
                Ver Resultados
              </Link>
            </Button>
          )
        }

        return (
          <div key={t.tournament_id} className={`group bg-gradient-to-br ${bgGradient} border ${borderColor} rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`} style={{ animationDelay: `${0.2 + idx * 0.1}s`, animationFillMode: 'both' }}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl bg-opacity-10 backdrop-blur-sm ${t.status === 'Próximo' ? 'bg-green-400' : t.status === 'En Curso' ? 'bg-yellow-400' : 'bg-purple-400'}`}>
                  {icon}
                </div>
                {statusBadge}
              </div>
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{t.name}</h3>
              <p className="text-sm text-slate-400 line-clamp-2">{t.description || "Torneo oficial LPP"}</p>
            </div>
            {actionButton}
          </div>
        )
      })}
    </div>
  )
}
