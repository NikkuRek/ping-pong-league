"use client"

import { useState, useEffect } from "react"
import type { Match, Inscription, FormattedSet, MatchData, TournamentDetails } from "@/types"
import { getApiUrl } from "@/lib/api-config"

export function usePlayerMatches(playerId: string, statusFilter?: "Finalizado" | "not-Finalizado") {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tournamentMap, setTournamentMap] = useState<Map<number, string>>(new Map())
  const [loadingTournaments, setLoadingTournaments] = useState(true)

  // Effect to fetch tournament data
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoadingTournaments(true)
      try {
        const apiUrl = getApiUrl()

        const response = await fetch(`${apiUrl}/tournament`)
        if (response.ok) {
          const data = await response.json()
          const newTournamentMap = new Map<number, string>()
          data.data.forEach((tournament: TournamentDetails) => {
            newTournamentMap.set(tournament.tournament_id, tournament.name)
          })
          setTournamentMap(newTournamentMap)
        } else {
          console.error("Failed to fetch tournament data")
        }
      } catch (err) {
        console.error("[v0] Error fetching tournaments:", err)
      } finally {
        setLoadingTournaments(false)
      }
    }
    fetchTournaments()
  }, [])

  useEffect(() => {
    if (!playerId) {
      setLoading(false)
      return
    }

    const fetchMatches = async () => {
      try {
        setLoading(true)
        const apiUrl = getApiUrl()

        const matchesRes = await fetch(`${apiUrl}/match/player/${playerId}`)

        if (!matchesRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const matchesData = await matchesRes.json()
  // Debug: log raw matches response from backend
  console.log("[usePlayerMatches] matchesRes.ok:", matchesRes.ok, "status:", matchesRes.status)
  console.log("[usePlayerMatches] matchesData:", matchesData)
        const playerMatches: Match[] = matchesData.data

        // Apply status filter if provided. "not-Finalizado" should include only upcoming statuses.
        let filteredPlayerMatches: Match[] = playerMatches
        if (statusFilter === "Finalizado") {
          filteredPlayerMatches = playerMatches.filter((m) => m.status === "Finalizado")
        } else if (statusFilter === "not-Finalizado") {
          // Define what counts as an upcoming match.
          const upcomingStatuses = new Set(["Pendiente", "En juego", "En Curso"])
          filteredPlayerMatches = playerMatches.filter((m) => upcomingStatuses.has(m.status))
        }

        // If the backend returns matches without nested inscription objects,
        // fetch inscriptions and build a map to resolve them by id.
        const inscriptionMap = new Map<number, Inscription>()
        const anyMissingInscriptions = playerMatches.some((m) => !m.inscription1 || !m.inscription2)
        if (anyMissingInscriptions) {
          try {
            const insRes = await fetch(`${apiUrl}/inscription`)
            if (insRes.ok) {
              const insJson = await insRes.json()
              const insList: Inscription[] = insJson.data || []
              insList.forEach((ins) => inscriptionMap.set(ins.inscription_id, ins))
              console.log("[usePlayerMatches] loaded inscriptions count:", inscriptionMap.size)
            } else {
              console.warn("[usePlayerMatches] failed to load inscriptions, status:", insRes.status)
            }
          } catch (err) {
            console.error("[usePlayerMatches] error fetching inscriptions:", err)
          }
        }

  const formattedMatches: MatchData[] = filteredPlayerMatches
          .map((match) => {
            // Resolve inscriptions from nested objects or from the fetched map
            const ins1: Inscription | undefined = match.inscription1 ?? inscriptionMap.get(match.inscription1_id)
            const ins2: Inscription | undefined = match.inscription2 ?? inscriptionMap.get(match.inscription2_id)

            const isPlayerParticipant1 = ins1?.player_ci === playerId

            const opponentInscription = isPlayerParticipant1 ? ins2 : ins1
            const playerInscription = isPlayerParticipant1 ? ins1 : ins2

            if (!opponentInscription || !playerInscription) {
              return null
            }

            const currentPlayerName = `${playerInscription.player.first_name} ${playerInscription.player.last_name}`
            const currentPlayerAvatar = "https://picsum.photos/seed/player1/40/40"

            const opponentName = `${opponentInscription.player.first_name} ${opponentInscription.player.last_name}`
            const opponentAvatar = "https://picsum.photos/seed/player2/96/96"

            let playerSetsWon = 0
            let opponentSetsWon = 0
            const formattedSets: FormattedSet[] = []

            if (match.sets && match.sets.length > 0) {
              match.sets.forEach((set) => {
                const p1Score = set.score_participant1
                const p2Score = set.score_participant2

                if (isPlayerParticipant1) {
                  if (p1Score > p2Score) playerSetsWon++
                  else opponentSetsWon++
                  formattedSets.push({ p1: p1Score, p2: p2Score })
                } else {
                  if (p2Score > p1Score) playerSetsWon++
                  else opponentSetsWon++
                  formattedSets.push({ p1: p2Score, p2: p1Score })
                }
              })
            }

            // Check if there are exactly 3 sets and all are 0-0
            const hasThreeSetsAllZero = formattedSets.length === 3 && formattedSets.every(set => set.p1 === 0 && set.p2 === 0)
            
            // If there are exactly 3 sets all 0-0 and there's a winner, adjust scores to 2-1
            if (hasThreeSetsAllZero && match.winner_inscription_id !== null) {
              if (match.winner_inscription_id === playerInscription.inscription_id) {
                playerSetsWon = 2
                opponentSetsWon = 1
              } else if (match.winner_inscription_id === opponentInscription.inscription_id) {
                playerSetsWon = 1
                opponentSetsWon = 2
              }
            }
            // For matches with 1 or 2 sets all 0-0, winner gets all sets
            else if (formattedSets.length > 0 && formattedSets.length < 3 && formattedSets.every(set => set.p1 === 0 && set.p2 === 0) && match.winner_inscription_id !== null) {
              if (match.winner_inscription_id === playerInscription.inscription_id) {
                playerSetsWon = formattedSets.length
                opponentSetsWon = 0
              } else if (match.winner_inscription_id === opponentInscription.inscription_id) {
                playerSetsWon = 0
                opponentSetsWon = formattedSets.length
              }
            }

            let result: "win" | "loss" | "no-result" = "no-result"

            if (match.winner_inscription_id !== null) {
              // Check if winner is the current player
              if (match.winner_inscription_id === playerInscription.inscription_id) {
                result = "win"
              }
              // Check if winner is the opponent
              else if (match.winner_inscription_id === opponentInscription.inscription_id) {
                result = "loss"
              }
              // If winner_inscription_id doesn't match either player, keep as "no-result"
            }

            const matchDate = new Date(match.match_datetime)
            const now = new Date()
            const diffMs = now.getTime() - matchDate.getTime()
            const diffHours = Math.round(diffMs / (1000 * 60 * 60))
            let timeAgo = `${diffHours} horas atrás`
            if (diffHours < 1) timeAgo = "Hace menos de una hora"
            else if (diffHours >= 24) {
              const diffDays = Math.round(diffHours / 24)
              timeAgo = `${diffDays} días atrás`
            }

            return {
              id: match.match_id.toString(),
              player1Name: currentPlayerName,
              player1Avatar: currentPlayerAvatar,
              player1Ci: playerInscription.player.ci,
              player2Name: opponentName,
              player2Avatar: opponentAvatar,
              player2Ci: opponentInscription.player.ci,
              score1: playerSetsWon,
              score2: opponentSetsWon,
              tournamentName: tournamentMap.get(match.tournament_id) || "Cargando Torneo...",
              timeAgo: timeAgo,
              updatedAt: match.updatedAt,
              sets: formattedSets,
                result: result,
              winnerInscriptionId: match.winner_inscription_id,
              playerInscriptionId: playerInscription.inscription_id,
              opponentInscriptionId: opponentInscription.inscription_id,
              matchDatetime: match.match_datetime,
            }
          })
          .filter((match): match is MatchData => match !== null)
          .sort((a, b) => new Date(b.matchDatetime).getTime() - new Date(a.matchDatetime).getTime())

        setMatches(formattedMatches)
      } catch (e: any) {
        console.error("[v0] Error fetching matches:", e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    if (!loadingTournaments) {
      fetchMatches()
    }
  }, [playerId, loadingTournaments, tournamentMap, statusFilter])

  return { matches, loading: loading || loadingTournaments, error }
}
