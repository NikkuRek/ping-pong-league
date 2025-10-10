"use client"

import { useState, useEffect } from "react"
import { getApiUrl } from "@/lib/api-config"
import type { TournamentDetail, Match, Inscription } from "@/types"

export function useTournamentDetail(tournamentId: string) {
  const [tournament, setTournament] = useState<TournamentDetail | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTournamentDetail = async () => {
      try {
        setLoading(true)
        const apiUrl = getApiUrl()

        // Fetch tournament details
        const tournamentResponse = await fetch(`${apiUrl}/tournament/${tournamentId}`)
        if (!tournamentResponse.ok) throw new Error("Failed to fetch tournament")
        const tournamentData = await tournamentResponse.json()

        // Fetch tournament matches
        const matchesResponse = await fetch(`${apiUrl}/match/tournament/${tournamentId}`)
        const matchesData = matchesResponse.ok ? await matchesResponse.json() : { data: [] }

        // Fetch tournament inscriptions
        const inscriptionsResponse = await fetch(`${apiUrl}/inscription/tournament/${tournamentId}`)
        const inscriptionsData = inscriptionsResponse.ok ? await inscriptionsResponse.json() : { data: [] }

        setTournament(tournamentData.data || tournamentData)
        setMatches(matchesData.data || [])
        setInscriptions(inscriptionsData.data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    if (tournamentId) {
      fetchTournamentDetail()
    }
  }, [tournamentId])

  return { tournament, matches, inscriptions, loading, error }
}
