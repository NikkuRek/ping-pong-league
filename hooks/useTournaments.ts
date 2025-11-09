"use client"

import { useState, useEffect } from "react"
import type { Tournament } from "@/types"
import { apiGet } from "@/lib/api"

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
        const data = await apiGet<Tournament[]>("/tournament")

        // Filter tournaments by status if provided
        let filteredTournaments = Array.isArray(data) ? data : []
        if (statusFilter && filteredTournaments.length > 0) {
          filteredTournaments = filteredTournaments.filter(
            (tournament: Tournament) => tournament.status === statusFilter,
          )
        }

        setTournaments(filteredTournaments)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching tournaments:", err)
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
