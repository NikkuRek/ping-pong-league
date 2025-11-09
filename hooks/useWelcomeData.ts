"use client"

import { useState, useEffect } from "react"
import type { Player, Tournament } from "@/types"
import { apiGet } from "@/lib/api"

export const useWelcomeData = () => {
  const [playerCount, setPlayerCount] = useState<number>(0)
  const [activeTournamentsCount, setActiveTournamentsCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersData, tournamentsData] = await Promise.all([
          apiGet<any>("/player/active"),
          apiGet<any>("/tournament"),
        ])

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
