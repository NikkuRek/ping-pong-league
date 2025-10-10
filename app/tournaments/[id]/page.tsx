"use client"

import { useEffect, useState } from "react"
import { useTournamentDetail } from "@/hooks/useTournamentDetail"
import { useTournamentStandings } from "@/hooks/useTournamentStandings"
import { ArrowLeftIcon } from "@/components/icons"
import Link from "next/link"
import type { Match } from "@/types"

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [tournamentId, setTournamentId] = useState<string | null>(null)

  useEffect(() => {
    params.then((resolvedParams) => {
      setTournamentId(resolvedParams.id)
    })
  }, [params])

  if (!tournamentId) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Cargando...</div>
        </div>
      </div>
    )
  }

  return <TournamentDetailContent id={tournamentId} />
}

function TournamentDetailContent({ id }: { id: string }) {
  const { tournament, matches, inscriptions, loading, error } = useTournamentDetail(id)
  const standings = useTournamentStandings(matches, inscriptions)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Cargando detalles del torneo...</div>
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-red-400">Error al cargar el torneo</div>
        </div>
      </div>
    )
  }

  const recentMatches = matches
    .filter((m) => m.status === "Finalizado")
    .slice(-5)
    .reverse()
  const upcomingMatches = matches.filter((m) => m.status !== "Finalizado").slice(0, 5)

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white p-6">
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
              <p className="text-slate-400">{tournament.description}</p>
            </div>
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${
                tournament.status === "En Curso"
                  ? "bg-green-500/20 text-green-400"
                  : tournament.status === "Finalizado"
                    ? "bg-gray-500/20 text-gray-400"
                    : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {tournament.status}
            </span>
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

        {/* Standings Table */}
        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-4">Tabla de Posiciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-4 py-3 text-left font-bold">Nombre</th>
                  <th className="px-4 py-3 text-center font-bold">JJ</th>
                  <th className="px-4 py-3 text-center font-bold">JG</th>
                  <th className="px-4 py-3 text-center font-bold">JP</th>
                  <th className="px-4 py-3 text-center font-bold">SG</th>
                  <th className="px-4 py-3 text-center font-bold">Pts</th>
                  <th className="px-4 py-3 text-center font-bold">Dif</th>
                  <th className="px-4 py-3 text-center font-bold">Pts. F</th>
                  <th className="px-4 py-3 text-center font-bold">Pts. C</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing, index) => (
                  <tr key={standing.player_ci} className={index % 2 === 0 ? "bg-blue-500/10" : "bg-green-500/10"}>
                    <td className="px-4 py-3 font-semibold">{standing.player_name}</td>
                    <td className="px-4 py-3 text-center">{standing.matches_played}</td>
                    <td className="px-4 py-3 text-center">{standing.matches_won}</td>
                    <td className="px-4 py-3 text-center">{standing.matches_lost}</td>
                    <td className="px-4 py-3 text-center">{standing.sets_won}</td>
                    <td className="px-4 py-3 text-center font-bold">{standing.points}</td>
                    <td
                      className={`px-4 py-3 text-center font-bold ${
                        standing.difference > 0
                          ? "text-green-400"
                          : standing.difference < 0
                            ? "text-red-400"
                            : "text-white"
                      }`}
                    >
                      {standing.difference}
                    </td>
                    <td className="px-4 py-3 text-center text-green-400">{standing.points_for}</td>
                    <td className="px-4 py-3 text-center text-red-400">{standing.points_against}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enrolled Players */}
        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-4">Jugadores Inscritos ({inscriptions.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inscriptions.map((inscription) => (
              <div key={inscription.inscription_id} className="bg-[#1A1A2E] p-4 rounded-lg">
                <p className="font-semibold">
                  {inscription.player.first_name} {inscription.player.last_name}
                </p>
                <p className="text-sm text-slate-400">Aura: {inscription.player.aura || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-4">Últimos 5 Partidos</h2>
          {recentMatches.length === 0 ? (
            <p className="text-slate-400">No hay partidos finalizados aún.</p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <MatchCard key={match.match_id} match={match} inscriptions={inscriptions} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-4">Próximos Partidos Destacados</h2>
          {upcomingMatches.length === 0 ? (
            <p className="text-slate-400">No hay partidos próximos programados.</p>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <MatchCard key={match.match_id} match={match} inscriptions={inscriptions} />
              ))}
            </div>
          )}
        </div>

        {/* Complete History */}
        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-4">Historial Completo ({matches.length} partidos)</h2>
          {matches.length === 0 ? (
            <p className="text-slate-400">No hay partidos registrados.</p>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchCard key={match.match_id} match={match} inscriptions={inscriptions} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, inscriptions }: { match: Match; inscriptions: any[] }) {
  const inscription1 = inscriptions.find((i) => i.inscription_id === match.inscription1_id)
  const inscription2 = inscriptions.find((i) => i.inscription_id === match.inscription2_id)

  if (!inscription1 || !inscription2) return null

  const player1Name = `${inscription1.player.first_name} ${inscription1.player.last_name}`
  const player2Name = `${inscription2.player.first_name} ${inscription2.player.last_name}`

  const player1SetsWon = match.sets.filter((s) => s.score_participant1 > s.score_participant2).length
  const player2SetsWon = match.sets.filter((s) => s.score_participant2 > s.score_participant1).length

  return (
    <div className="bg-[#1A1A2E] p-4 rounded-lg flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold">{player1Name}</span>
          <span className="text-slate-400">vs</span>
          <span className="font-semibold">{player2Name}</span>
        </div>
        <div className="text-sm text-slate-400">
          {new Date(match.match_datetime).toLocaleDateString()} • {match.round}
        </div>
      </div>
      <div className="text-right">
        {match.status === "Finalizado" ? (
          <div className="text-lg font-bold">
            {player1SetsWon} - {player2SetsWon}
          </div>
        ) : (
          <span className="text-sm text-blue-400">{match.status}</span>
        )}
      </div>
    </div>
  )
}
