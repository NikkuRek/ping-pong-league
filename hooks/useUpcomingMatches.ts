"use client"

import { useState, useEffect } from "react"
import type { Match, Inscription, Player, FormattedSet, MatchData, TournamentDetails } from "@/types"
import { getApiUrl } from "@/lib/api-config"

export function useUpcomingMatches(playerId: string) {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tournamentMap, setTournamentMap] = useState<Map<number, string>>(new Map())
  const [loadingTournaments, setLoadingTournaments] = useState(true)
  const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<string, Player>>(new Map()) // Using Player from @/types for now

  // Effect to fetch tournament data once
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
    const fetchMatchesAndPlayers = async () => {
      if (!playerId) {
        setMatches([])
        setLoading(false)
        return
      }
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

        // Filter for upcoming matches (status not "Finalizado") for the given player
        const upcomingMatches = allMatches.filter((match) => {
          const inscription1 = allInscriptions.find((i) => i.inscription_id === match.inscription1_id)
          const inscription2 = allInscriptions.find((i) => i.inscription_id === match.inscription2_id)
          return (
            match.status !== "Finalizado" &&
            (inscription1?.player_ci === playerId || inscription2?.player_ci === playerId)
          )
        })

        const uniquePlayerCis = new Set<string>()
        upcomingMatches.forEach((match) => {
          const inscription1 = allInscriptions.find((i) => i.inscription_id === match.inscription1_id)
          const inscription2 = allInscriptions.find((i) => i.inscription_id === match.inscription2_id)
          if (inscription1) uniquePlayerCis.add(inscription1.player_ci)
          if (inscription2) uniquePlayerCis.add(inscription2.player_ci)
        })

        const newPlayerDetailsMap = new Map<string, Player>()
        for (const ci of Array.from(uniquePlayerCis)) {
          if (!playerDetailsMap.has(ci)) {
            try {
              const response = await fetch(`${apiUrl}/player/${ci}`)
              if (response.ok) {
                const data = await response.json()
                newPlayerDetailsMap.set(ci, data.data)
              } else {
                console.error(`Failed to fetch player details for CI: ${ci}`)
              }
            } catch (err) {
              console.error(`Error fetching player details for CI: ${ci}`, err)
            }
          }
        }
        setPlayerDetailsMap((prevMap) => new Map([...prevMap, ...newPlayerDetailsMap]))

        const formattedMatches: MatchData[] = upcomingMatches.map((match) => {
          const inscription1 = allInscriptions.find((i) => i.inscription_id === match.inscription1_id)
          const inscription2 = allInscriptions.find((i) => i.inscription_id === match.inscription2_id)

          const player1Name = inscription1
            ? `${inscription1.player.first_name} ${inscription1.player.last_name}`
            : "Unknown Player"
          const player1Ci = inscription1 ? inscription1.player_ci : ""
          const player1Avatar = "https://picsum.photos/seed/player1/40/40"

          const player2Name = inscription2
            ? `${inscription2.player.first_name} ${inscription2.player.last_name}`
            : "Unknown Player"
          const player2Ci = inscription2 ? inscription2.player_ci : ""
          const player2Avatar = "https://picsum.photos/seed/player2/40/40"

          const formattedSets: FormattedSet[] = []
          const score1 = 0
          const score2 = 0

          const matchDate = new Date(match.match_datetime)
          const now = new Date()
          const diffMs = matchDate.getTime() - now.getTime()
          const diffHours = Math.round(diffMs / (1000 * 60 * 60))
          let timeAgo = `En ${diffHours} horas`
          if (diffHours < 1) timeAgo = "Próximamente"
          else if (diffHours >= 24) {
            const diffDays = Math.round(diffHours / 24)
            timeAgo = `En ${diffDays} días`
          }

          return {
            id: match.match_id.toString(),
            player1Name: player1Name,
            player1Avatar: player1Avatar,
            player1Ci: player1Ci,
            player2Name: player2Name,
            player2Avatar: player2Avatar,
            player2Ci: player2Ci,
            score1: score1,
            score2: score2,
            tournamentName: tournamentMap.get(match.tournament_id) || "Torneo Mock",
            timeAgo: timeAgo,
            sets: formattedSets,
            result: "",
          }
        })

        setMatches(formattedMatches)
      } catch (e: any) {
        console.error("[v0] Error fetching upcoming matches:", e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    if (!loadingTournaments) {
      fetchMatchesAndPlayers()
    }
  }, [loadingTournaments, tournamentMap, playerId])

  return { matches, loading: loading || loadingTournaments, error }
}
