"use client"

import { useState, useEffect } from "react"
import type { Match, Inscription, FormattedSet, Tournament } from "@/types"
import { getApiUrl } from "@/lib/api-config"

export interface AllMatchData {
  id: string
  player1Ci: string
  player1Name: string
  player1Avatar: string
  player2Ci: string
  player2Name: string
  player2Avatar: string
  score1: number
  score2: number
  tournamentId: number
  tournamentName: string
  matchDatetime: string
  timeAgo: string
  status: string
  round: string
  sets: FormattedSet[]
  winnerInscriptionId: number | null
  inscription1Id: number
  inscription2Id: number
}

export function useAllMatches() {
  const [matches, setMatches] = useState<AllMatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        setLoading(true)
        const apiUrl = getApiUrl()

        const [matchesRes, inscriptionsRes, tournamentsRes] = await Promise.all([
          fetch(`${apiUrl}/match`),
          fetch(`${apiUrl}/inscription`),
          fetch(`${apiUrl}/tournament`),
        ])

        if (!matchesRes.ok || !inscriptionsRes.ok || !tournamentsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const matchesData = await matchesRes.json()
        const inscriptionsData = await inscriptionsRes.json()
        const tournamentsData = await tournamentsRes.json()

        const allMatches: Match[] = matchesData.data
        const allInscriptions: Inscription[] = inscriptionsData.data
        const allTournaments: Tournament[] = tournamentsData.data

        // Create tournament map
        const tournamentMap = new Map<number, string>()
        allTournaments.forEach((tournament) => {
          tournamentMap.set(tournament.tournament_id, tournament.name)
        })

        const formattedMatches: AllMatchData[] = allMatches
          .map((match) => {
            const inscription1 = allInscriptions.find(
              (inscription) => inscription.inscription_id === match.inscription1_id
            )
            const inscription2 = allInscriptions.find(
              (inscription) => inscription.inscription_id === match.inscription2_id
            )

            if (!inscription1 || !inscription2) {
              return null
            }

            const player1Name = `${inscription1.player.first_name} ${inscription1.player.last_name}`
            const player2Name = `${inscription2.player.first_name} ${inscription2.player.last_name}`

            // Calculate sets won
            let player1SetsWon = 0
            let player2SetsWon = 0
            const formattedSets: FormattedSet[] = []

            if (match.sets && match.sets.length > 0) {
              match.sets.forEach((set) => {
                const p1Score = set.score_participant1
                const p2Score = set.score_participant2

                if (p1Score > p2Score) player1SetsWon++
                else if (p2Score > p1Score) player2SetsWon++

                formattedSets.push({ p1: p1Score, p2: p2Score })
              })
            }

            // Check if there are exactly 3 sets and all are 0-0
            const hasThreeSetsAllZero = formattedSets.length === 3 && formattedSets.every(set => set.p1 === 0 && set.p2 === 0)
            
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
            else if (formattedSets.length > 0 && formattedSets.length < 3 && formattedSets.every(set => set.p1 === 0 && set.p2 === 0) && match.winner_inscription_id !== null) {
              if (match.winner_inscription_id === match.inscription1_id) {
                player1SetsWon = formattedSets.length
                player2SetsWon = 0
              } else if (match.winner_inscription_id === match.inscription2_id) {
                player1SetsWon = 0
                player2SetsWon = formattedSets.length
              }
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
              player1Ci: inscription1.player.ci,
              player1Name,
              player1Avatar: "https://picsum.photos/seed/player1/96/96",
              player2Ci: inscription2.player.ci,
              player2Name,
              player2Avatar: "https://picsum.photos/seed/player2/96/96",
              score1: player1SetsWon,
              score2: player2SetsWon,
              tournamentId: match.tournament_id,
              tournamentName: tournamentMap.get(match.tournament_id) || "Torneo Desconocido",
              matchDatetime: match.match_datetime,
              timeAgo,
              status: match.status,
              round: match.round,
              sets: formattedSets,
              winnerInscriptionId: match.winner_inscription_id,
              inscription1Id: match.inscription1_id,
              inscription2Id: match.inscription2_id,
            }
          })
          .filter((match): match is AllMatchData => match !== null)

        setMatches(formattedMatches)
      } catch (e: any) {
        console.error("Error fetching all matches:", e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchAllMatches()
  }, [])

  return { matches, loading, error }
}
