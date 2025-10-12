"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTournamentDetail } from "@/hooks/useTournamentDetail"
import { useTournamentStandings } from "@/hooks/useTournamentStandings"
import { ArrowLeftIcon } from "@/components/icons"
import Link from "next/link"
import { Tooltip } from "@/components/ui/tooltip"
import type { Match } from "@/types"

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const [tournamentId, setTournamentId] = useState<string | null>(null)

  useEffect(() => {
    setTournamentId(params.id)
  }, [params])

  if (!tournamentId) {
    return (
      <div className="min-h-screen bg-[#1c1c2e] text-white">
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
      <div className="min-h-screen bg-[#1c1c2e] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Cargando detalles del torneo...</div>
        </div>
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
          <div className="bg-[#2A2A3E] p-2 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold p-4">Tabla de Posiciones</h2>
          <div className="space-y-3">
            {standings.map((standing, index) => {
              // Calculate qualification spots based on total participants
              const totalParticipants = standings.length
              let qualifiedSpots = 0
              let almostQualifiedSpots = 0

              if (totalParticipants >= 20) {
                qualifiedSpots = 16
                almostQualifiedSpots = 0
              } else if (totalParticipants >= 16) {
                qualifiedSpots = 4
                almostQualifiedSpots = 6
              } else if (totalParticipants >= 14) {
                qualifiedSpots = 6
                almostQualifiedSpots = 4
              } else if (totalParticipants >= 12) {
                qualifiedSpots = 8
                almostQualifiedSpots = 0
              }

              // Determine styling based on index (order in list), not position
              const isQualified = index < qualifiedSpots
              const isAlmostQualified = index >= qualifiedSpots && index < (qualifiedSpots + almostQualifiedSpots)

              let backgroundClass = "bg-gradient-to-r from-[#37374D] to-[#454557]"
              let borderClass = "border-slate-500"
              
              if (isQualified) {
                backgroundClass = "bg-gradient-to-r from-[#6E2DBD] to-[#6B18D9]"
                borderClass = "border-indigo-600"
              } else if (isAlmostQualified) {
                backgroundClass = "bg-gradient-to-r from-[#7C57AD] to-[#6655A6]"
                borderClass = "border-indigo-600"
              }

              const nameColorClass = "text-slate-50"
              const detailsColorClass = "text-slate-50"

              // Extract first name and first last name
              const getShortName = (fullName: string): string => {
                if (!fullName) return "—"
                const names = fullName.trim().split(/\s+/).filter(n => n.length > 0)
                if (names.length === 0) return "—"
                if (names.length === 1) return names[0]
                const firstName = names[0]
                const midPoint = Math.ceil(names.length / 2)
                const firstLastName = names[midPoint] || names[1]
                return `${firstName} ${firstLastName}`
              }

              const shortName = getShortName(standing.player_name)

              return (
                <Link
                  key={standing.player_ci}
                  href={`/players/${standing.player_ci}`}
                  className={`flex items-center p-4 rounded-lg border ${borderClass} ${backgroundClass} hover:opacity-95 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    {/* Left side - Rank and player info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`text-2xl font-bold ${nameColorClass} w-8 text-center flex-shrink-0`}>
                        {standing.displayPosition}
                      </div>
                      <Image
                        src={`https://picsum.photos/seed/${standing.player_ci}/40/40`}
                        alt={standing.player_name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover flex-shrink-0"
                        unoptimized
                      />
                      <div className="text-left min-w-0 flex-1">
                        <p className={`font-semibold ${nameColorClass} truncate`}>{shortName}</p>
                        <p className={`text-xs ${detailsColorClass}`}>
                          {standing.matches_won}G - {standing.matches_lost}P
                          {standing.bonus_points > 0 && (
                            <span className="text-emerald-300">
                              {" "}(+{standing.bonus_points} bonus)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Stats */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Tooltip
                        content={
                          <div className="text-left space-y-1">
                            <p className="font-semibold text-white mb-2">Desglose de puntos:</p>
                            <p className="text-slate-300">• {standing.matches_won} victorias: {standing.matches_won * 3} pts</p>
                            {standing.losses_1_2 > 0 && (
                              <p className="text-emerald-400">• {standing.losses_1_2} derrota(s) 1-2: {standing.losses_1_2} pt(s)</p>
                            )}
                            {standing.losses_0_2 > 0 && (
                              <p className="text-slate-400">• {standing.losses_0_2} derrota(s) 0-2: 0 pts</p>
                            )}
                            <div className="border-t border-slate-600 mt-2 pt-2">
                              <p className="text-white font-bold">Total: {standing.points} pts</p>
                            </div>
                          </div>
                        }
                      >
                        <div className="text-center cursor-help">
                          <p className={`text-xs ${detailsColorClass}`}>Pts</p>
                          <p className={`font-bold text-lg ${nameColorClass}`}>{standing.points}</p>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          </div>
        )}

        {/* Upcoming Matches */}
        <div className="bg-[#2A2A3E] p-2 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold p-4">Próximos Partidos</h2>
          {matches.filter(m => m.status !== "Finalizado").length === 0 ? (
            <p className="text-slate-400 p-4">No hay partidos próximos.</p>
          ) : (
            <div className="space-y-4 p-4">
              {matches
                .filter(m => m.status !== "Finalizado")
                .map((match) => (
                  <MatchCard key={match.match_id} match={match} inscriptions={inscriptions} />
                ))}
            </div>
          )}
        </div>

        {/* Finished Matches */}
        <div className="bg-[#2A2A3E] mb-20 p-2 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold p-4">Partidos Finalizados</h2>
          {matches.filter(m => m.status === "Finalizado").length === 0 ? (
            <p className="text-slate-400 p-4">No hay partidos finalizados.</p>
          ) : (
            <div className="space-y-4 p-4">
              {matches
                .filter(m => m.status === "Finalizado")
                .sort((a, b) => new Date(b.match_datetime).getTime() - new Date(a.match_datetime).getTime())
                .map((match) => (
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

  // Calculate sets won with 0-0 logic
  let player1SetsWon = 0
  let player2SetsWon = 0

  if (match.sets && match.sets.length > 0) {
    match.sets.forEach((set) => {
      const p1Score = set.score_participant1
      const p2Score = set.score_participant2

      if (p1Score > p2Score) player1SetsWon++
      else if (p2Score > p1Score) player2SetsWon++
    })
  }

  // Check if there are exactly 3 sets and all are 0-0
  const hasThreeSetsAllZero = match.sets.length === 3 && match.sets.every(set => set.score_participant1 === 0 && set.score_participant2 === 0)
  
  // If there are exactly 3 sets all 0-0 and there's a winner, adjust scores to 2-1
  if (hasThreeSetsAllZero && match.winner_inscription_id !== null) {
    if (match.winner_inscription_id === match.inscription1_id) {
      player1SetsWon = 2
      player2SetsWon = 1
    } else if (match.winner_inscription_id === match.inscription2_id) {
      player1SetsWon = 1
      player2SetsWon = 2
    }
  }
  // For matches with 1 or 2 sets all 0-0, winner gets all sets
  else if (match.sets.length > 0 && match.sets.length < 3 && match.sets.every(set => set.score_participant1 === 0 && set.score_participant2 === 0) && match.winner_inscription_id !== null) {
    if (match.winner_inscription_id === match.inscription1_id) {
      player1SetsWon = match.sets.length
      player2SetsWon = 0
    } else if (match.winner_inscription_id === match.inscription2_id) {
      player1SetsWon = 0
      player2SetsWon = match.sets.length
    }
  }

  const getShortName = (fullName: string): { firstName: string; lastName: string } => {
    if (!fullName) return { firstName: "—", lastName: "" }
    const names = fullName.trim().split(/\s+/).filter(n => n.length > 0)
    if (names.length === 0) return { firstName: "—", lastName: "" }
    if (names.length === 1) return { firstName: names[0], lastName: "" }
    const firstName = names[0]
    const midPoint = Math.ceil(names.length / 2)
    const firstLastName = names[midPoint] || names[1]
    return { firstName, lastName: firstLastName }
  }

  const player1Short = getShortName(player1Name)
  const player2Short = getShortName(player2Name)

  const isFinished = match.status === "Finalizado"

  return (
    <div className="bg-[#2a2a3e] p-4 rounded-2xl border border-slate-700/50">
      {/* Grid layout for match info */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
        {/* Player 1 */}
        <Link href={`/players/${inscription1.player.ci}`} className="grid grid-cols-[48px_1fr] gap-3 items-center hover:opacity-80 transition-opacity">
          <Image 
            src={`https://picsum.photos/seed/${inscription1.player.ci}/48/48`}
            alt={player1Name} 
            width={48} 
            height={48} 
            className="rounded-full w-12 h-12" 
            unoptimized 
          />
          <div className="min-w-0">
            <div className="font-bold text-white hover:text-purple-400 transition-colors leading-tight">
              <p className="break-words">{player1Short.firstName}</p>
              {player1Short.lastName && <p className="break-words">{player1Short.lastName}</p>}
            </div>
            <p className="text-xs text-slate-400 mt-1">Aura: {inscription1.player.aura || 0}</p>
          </div>
        </Link>

        {/* Score */}
        <div className="text-center px-4">
          <p className="text-2xl font-bold whitespace-nowrap">
            <span className={isFinished && player1SetsWon > player2SetsWon ? "text-white" : "text-slate-400"}>{player1SetsWon}</span>
            <span className="text-slate-500 mx-2">VS</span>
            <span className={isFinished && player2SetsWon > player1SetsWon ? "text-white" : "text-slate-400"}>{player2SetsWon}</span>
          </p>
          <p className={`text-xs mt-1 ${match.status === "Finalizado" ? "text-emerald-400" : "text-yellow-400"}`}>
            {match.status}
          </p>
        </div>

        {/* Player 2 */}
        <Link href={`/players/${inscription2.player.ci}`} className="grid grid-cols-[1fr_48px] gap-3 items-center hover:opacity-80 transition-opacity">
          <div className="text-right min-w-0">
            <div className="font-bold text-white hover:text-purple-400 transition-colors leading-tight">
              <p className="break-words">{player2Short.firstName}</p>
              {player2Short.lastName && <p className="break-words">{player2Short.lastName}</p>}
            </div>
            <p className="text-xs text-slate-400 mt-1">Aura: {inscription2.player.aura || 0}</p>
          </div>
          <Image 
            src={`https://picsum.photos/seed/${inscription2.player.ci}/48/48`}
            alt={player2Name} 
            width={48} 
            height={48} 
            className="rounded-full w-12 h-12" 
            unoptimized 
          />
        </Link>
      </div>

      {/* Match info */}
      <div className="text-center border-t border-slate-700/50 pt-3">
        <p className="text-sm text-slate-400">{new Date(match.match_datetime).toLocaleDateString()}</p>
        <p className="text-xs text-slate-500">{match.round}</p>
      </div>

      {/* Sets - only show if finished and not all 0-0 */}
      {isFinished && match.sets.some(s => s.score_participant1 > 0 || s.score_participant2 > 0) && (
        <div className="flex justify-center gap-2 flex-wrap mt-3">
          {match.sets
            .filter((set) => !(set.score_participant1 === 0 && set.score_participant2 === 0))
            .map((set, index) => (
              <div key={index} className={`px-3 py-1 rounded text-sm font-semibold ${
                set.score_participant1 > set.score_participant2 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {set.score_participant1}-{set.score_participant2}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}