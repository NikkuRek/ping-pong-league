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

        console.log("[v0] Fetching tournament details for ID:", tournamentId)
        console.log("[v0] API URL:", apiUrl)

        // Fetch tournament details
        const tournamentUrl = `${apiUrl}/tournament/${tournamentId}`
        console.log("[v0] Fetching tournament from:", tournamentUrl)
        const tournamentResponse = await fetch(tournamentUrl)
        console.log("[v0] Tournament response status:", tournamentResponse.status)

        if (!tournamentResponse.ok) {
          const errorText = await tournamentResponse.text()
          console.log("[v0] Tournament error response:", errorText)
          throw new Error("Failed to fetch tournament")
        }
        const tournamentData = await tournamentResponse.json()
        console.log("[v0] Tournament data:", tournamentData)

        // Fetch tournament matches
        const matchesUrl = `${apiUrl}/match/tournament/${tournamentId}`
        console.log("[v0] Fetching matches from:", matchesUrl)
        const matchesResponse = await fetch(matchesUrl)
        console.log("[v0] Matches response status:", matchesResponse.status)
        const matchesData = matchesResponse.ok ? await matchesResponse.json() : { data: [] }
        console.log("[v0] Matches data:", matchesData)

        // Fetch tournament inscriptions
        const inscriptionsUrl = `${apiUrl}/inscription/tournament/${tournamentId}`
        console.log("[v0] Fetching inscriptions from:", inscriptionsUrl)
        const inscriptionsResponse = await fetch(inscriptionsUrl)
        console.log("[v0] Inscriptions response status:", inscriptionsResponse.status)
        const inscriptionsData = inscriptionsResponse.ok ? await inscriptionsResponse.json() : { data: [] }
        console.log("[v0] Inscriptions data:", inscriptionsData)

        setTournament(tournamentData.data || tournamentData)
        setMatches(matchesData.data || [])
        setInscriptions(inscriptionsData.data || [])
      } catch (err) {
        console.error("[v0] Error fetching tournament details:", err)
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
