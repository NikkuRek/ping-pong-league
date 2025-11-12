"use client"

import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"

const BASE_MATCHES = 10

export function usePlayerRemainingMatches(ci: string) {
  const [remainingMatches, setRemainingMatches] = useState(BASE_MATCHES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ci) {
      apiGet(`/match/player/${ci}/current-week-matches`)
        .then(response => {
          const playedMatches = response.data.length
          setRemainingMatches(BASE_MATCHES - playedMatches)
        })
        .catch(error => {
          console.error("Error fetching current week matches:", error)
          setRemainingMatches(BASE_MATCHES) // Fallback to base
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [ci])

  return { remainingMatches, loading }
}
