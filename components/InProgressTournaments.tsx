"use client"

import type React from "react"
import { ArrowRightIcon } from "./icons"
import { useTournaments } from "@/hooks/useTournaments"
import type { Tournament } from "@/types"
import Link from "next/link"

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  const calculateProgress = () => {
    if (!tournament.start_date) return 0
    if (tournament.status === "Finalizado") return 100
    if (tournament.status === "Próximo") return 0

    // For "En Curso" tournaments, calculate based on dates if end_date exists
    if (tournament.end_date) {
      const start = new Date(tournament.start_date).getTime()
      const end = new Date(tournament.end_date).getTime()
      const now = Date.now()
      const progress = ((now - start) / (end - start)) * 100
      return Math.min(Math.max(progress, 0), 100)
    }

    return 50 // Default progress for ongoing tournaments without end date
  }

  const progress = Math.round(calculateProgress())

  return (
    <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
          <p className="text-sm text-slate-400">
            {tournament.tournament_type} • {tournament.format}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-400">{progress}%</p>
          <p className="text-sm text-slate-400">Completado</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            tournament.status === "En Curso"
              ? "bg-green-500/20 text-green-400"
              : tournament.status === "Finalizado"
                ? "bg-gray-500/20 text-gray-400"
                : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {tournament.status}
        </span>
        {tournament.description && <span className="text-sm text-slate-400 truncate">{tournament.description}</span>}
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-400">Inicio: {new Date(tournament.start_date).toLocaleDateString()}</div>
        <Link
          href={`/tournaments/${tournament.tournament_id}`}
          className="flex items-center gap-2 text-sm text-blue-400 font-semibold hover:text-blue-300"
        >
          Ver Detalles <ArrowRightIcon />
        </Link>
      </div>
    </div>
  )
}

const InProgressTournaments: React.FC = () => {
  const { tournaments, loading, error } = useTournaments("En Curso")

  if (loading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Torneos en Curso</h2>
        </div>
        <div className="text-center py-8 text-slate-400">Cargando torneos...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Torneos en Curso</h2>
        </div>
        <div className="text-center py-8 text-red-400">Error al cargar torneos: {error.message}</div>
      </section>
    )
  }

  if (tournaments.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Torneos en Curso</h2>
        </div>
        <div className="text-center py-8 text-slate-400">No hay torneos en curso actualmente.</div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Torneos en Curso</h2>
      </div>
      <div className="space-y-4">
        {tournaments.map((t) => (
          <TournamentCard key={t.tournament_id} tournament={t} />
        ))}
      </div>
    </section>
  )
}

export default InProgressTournaments
