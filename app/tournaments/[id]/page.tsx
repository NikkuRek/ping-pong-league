"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTournamentDetail } from "@/hooks/useTournamentDetail"
import { useTournamentStandings } from "@/hooks/useTournamentStandings"
import { ArrowLeftIcon } from "@/components/icons"
import Link from "next/link"
import { Tooltip } from "@/components/ui/tooltip"
import type { Match } from "@/types"
import { MatchCard } from "@/components/ui/match-card"
import { StandingsTable } from "@/components/ui/standings-table"
import { MatchList } from "@/components/ui/match-list"

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const { tournament, matches, inscriptions, loading, error } = useTournamentDetail(params.id)
  const standings = useTournamentStandings(matches, inscriptions)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Cargando datos...</p>
      </div>
    )  
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#1c1c2e] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-red-400">Error al cargar el torneo</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1c1c2e] text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/tournaments"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon />
            Volver
          </Link>
        </div>

        {/* Tournament Info */}
        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
            </div>
            <span
              className={`w-1/4 px-4 py-2 text-xs font-semibold rounded-full text-center ${
                tournament.status === "En Curso"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : tournament.status === "Finalizado"
                    ? "bg-gray-500/20 text-gray-400"
                    : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {tournament.status}
            </span>
          </div>
          <div className="mb-4">
            <p className="text-slate-400">{tournament.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Tipo</p>
              <p className="font-semibold">{tournament.tournament_type}</p>
            </div>
            <div>
              <p className="text-slate-400">Formato</p>
              <p className="font-semibold">{tournament.format}</p>
            </div>
            <div>
              <p className="text-slate-400">Inicio</p>
              <p className="font-semibold">{new Date(tournament.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Fin</p>
              <p className="font-semibold">
                {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : "Sin definir"}
              </p>
            </div>
          </div>
        </div>

        {/* Standings Table - Only show for "Liga" format */}
        {tournament.format === "Liga" && (
          <StandingsTable standings={standings} />
        )}

        {/* Upcoming Matches */}
        <MatchList
          title="Próximos Partidos"
          matches={matches.filter(m => m.status !== "Finalizado")}
          inscriptions={inscriptions}
        />

        {/* Finished Matches */}
        <MatchList
          title="Partidos Finalizados"
          matches={matches
            .filter(m => m.status === "Finalizado")
            .sort((a, b) => new Date(b.match_datetime).getTime() - new Date(a.match_datetime).getTime())}
          inscriptions={inscriptions}
        />
      </div>
    </div>
  )
}

