"use client"

import { useState, useEffect } from "react"
import type { Player, Tournament } from "@/types"
import { getApiUrl } from "@/lib/api-config"

export const useWelcomeData = () => {
  const [playerCount, setPlayerCount] = useState<number>(0)
  const [activeTournamentsCount, setActiveTournamentsCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = getApiUrl()

        const [playersResponse, tournamentsResponse] = await Promise.all([
          fetch(`${apiUrl}/player/active`),
          fetch(`${apiUrl}/tournament`),
        ])

        if (!playersResponse.ok) {
          throw new Error(`Player API HTTP error! status: ${playersResponse.status}`)
        }
        if (!tournamentsResponse.ok) {
          throw new Error(`Tournament API HTTP error! status: ${tournamentsResponse.status}`)
        }

        const playersData = await playersResponse.json()
        const tournamentsData = await tournamentsResponse.json()

        const players: Player[] = Array.isArray(playersData) ? playersData : playersData.data
        setPlayerCount(players.length)

        const tournaments: Tournament[] = Array.isArray(tournamentsData) ? tournamentsData : tournamentsData.data
        const activeTournaments = tournaments.filter(
          (tournament: Tournament) => tournament.status === "Próximo" || tournament.status === "En Curso",
        )
        setActiveTournamentsCount(activeTournaments.length)
      } catch (e) {
        console.error("[v0] Error fetching welcome data:", e)
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { playerCount, activeTournamentsCount, loading, error }
}
