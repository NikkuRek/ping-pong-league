"use client"

import { useState, useEffect } from "react"
import { getApiUrl } from "@/lib/api-config"
import type { Tournament } from "@/types"

interface UseTournamentsResult {
  tournaments: Tournament[]
  loading: boolean
  error: Error | null
}

export function useTournaments(statusFilter?: string): UseTournamentsResult {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true)
        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/tournament`)

        if (!response.ok) {
          throw new Error(`Failed to fetch tournaments: ${response.statusText}`)
        }

        const data = await response.json()

        // Filter tournaments by status if provided
        let filteredTournaments = data.data || []
        if (statusFilter) {
          filteredTournaments = filteredTournaments.filter(
            (tournament: Tournament) => tournament.status === statusFilter,
          )
        }

        setTournaments(filteredTournaments)
        setError(null)
      } catch (err) {
        console.error("Error fetching tournaments:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setTournaments([])
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [statusFilter])

  return { tournaments, loading, error }
}
