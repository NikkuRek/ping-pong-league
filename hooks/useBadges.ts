"use client"

import { useState, useEffect, useMemo } from "react"
import { Match, Inscription, Tournament } from "@/types"
import { getApiUrl } from "@/lib/api-config"
import { computeBadges, Badge } from "@/lib/badges"

export function useBadges() {
  const [finals, setFinals] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = getApiUrl()
        const [fRes, tRes] = await Promise.all([
          fetch(`${apiUrl}/match/finals`),
          fetch(`${apiUrl}/tournament`)
        ])

        if (!fRes.ok || !tRes.ok) {
          throw new Error("Failed to fetch badges data")
        }

        const [fJson, tJson] = await Promise.all([fRes.json(), tRes.json()])
        setFinals(fJson.data || [])
        setTournaments(tJson.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading badges")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getBadgesForPlayer = useMemo(() => {
    return (ci: string, playerMatches: Match[], playerProfile?: any) => 
      computeBadges(ci, playerMatches, finals, tournaments, playerProfile)
  }, [finals, tournaments])

  return { getBadgesForPlayer, loading, error }
}
