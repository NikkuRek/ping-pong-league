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

        const [matchesRes, inscriptionsRes] = await Promise.all([
          fetch(`${apiUrl}/match`),
          fetch(`${apiUrl}/inscription`),
        ])

        if (!matchesRes.ok || !inscriptionsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const matchesData = await matchesRes.json()
        const inscriptionsData = await inscriptionsRes.json()

        const allMatches: Match[] = matchesData.data
        const allInscriptions: Inscription[] = inscriptionsData.data

        const playerInscriptions = allInscriptions.filter((inscription) => inscription.player_ci === playerId)
        const playerInscriptionIds = playerInscriptions.map((inscription) => inscription.inscription_id)

        const currentPlayer = playerInscriptions.length > 0 ? playerInscriptions[0].player : null
        const currentPlayerName = currentPlayer ? `${currentPlayer.first_name} ${currentPlayer.last_name}` : "You"
        const currentPlayerAvatar = "https://picsum.photos/seed/player1/40/40"

        const playerMatches = allMatches.filter((match) => {
          const isP1 = playerInscriptionIds.includes(match.inscription1_id)
          const isP2 = playerInscriptionIds.includes(match.inscription2_id)
          const isPlayerMatch = (isP1 || isP2) && match.inscription1_id !== match.inscription2_id

          if (!isPlayerMatch) return false

          // Apply status filter
          if (statusFilter === "Finalizado") {
            return match.status === "Finalizado"
          } else if (statusFilter === "not-Finalizado") {
            return match.status !== "Finalizado"
          }

          return true // No filter, return all matches
        })

        const formattedMatches: MatchData[] = playerMatches
          .map((match) => {
            const isPlayerParticipant1 = playerInscriptionIds.includes(match.inscription1_id)

            const opponentInscriptionId = isPlayerParticipant1 ? match.inscription2_id : match.inscription1_id
            const opponentInscription = allInscriptions.find(
              (inscription) => inscription.inscription_id === opponentInscriptionId,
            )

            const playerInscriptionId = isPlayerParticipant1 ? match.inscription1_id : match.inscription2_id
            const playerInscription = allInscriptions.find(
              (inscription) => inscription.inscription_id === playerInscriptionId,
            )

            if (!opponentInscription || !playerInscription) {
              return null
            }

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
              if (playerInscriptionIds.includes(match.winner_inscription_id)) {
                playerSetsWon = 2
                opponentSetsWon = 1
              } else if (match.winner_inscription_id === opponentInscriptionId) {
                playerSetsWon = 1
                opponentSetsWon = 2
              }
            }
            // For matches with 1 or 2 sets all 0-0, winner gets all sets
            else if (formattedSets.length > 0 && formattedSets.length < 3 && formattedSets.every(set => set.p1 === 0 && set.p2 === 0) && match.winner_inscription_id !== null) {
              if (playerInscriptionIds.includes(match.winner_inscription_id)) {
                playerSetsWon = formattedSets.length
                opponentSetsWon = 0
              } else if (match.winner_inscription_id === opponentInscriptionId) {
                playerSetsWon = 0
                opponentSetsWon = formattedSets.length
              }
            }

            let result: "win" | "loss" | "no-result" = "no-result"

            if (match.winner_inscription_id !== null) {
              // Check if winner is the current player
              if (playerInscriptionIds.includes(match.winner_inscription_id)) {
                result = "win"
              }
              // Check if winner is the opponent
              else if (match.winner_inscription_id === opponentInscriptionId) {
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
              sets: formattedSets,
              result: result,
              winnerInscriptionId: match.winner_inscription_id,
              playerInscriptionId: playerInscriptionId,
              opponentInscriptionId: opponentInscriptionId,
            }
          })
          .filter((match): match is MatchData => match !== null)
          .sort((a, b) => new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime())

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
