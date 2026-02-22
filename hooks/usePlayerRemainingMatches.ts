"use client"

import { useEffect, useState } from "react"
import { getApiUrl } from "@/lib/api-config"

const MAX_MATCHES = 10

export interface PlayerRemainingMatchesResult {
  played: number
  remaining: number
  max: number
  loading: boolean
  error: boolean
}

export function usePlayerRemainingMatches(ci: string): PlayerRemainingMatchesResult {
  const [played, setPlayed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!ci) return

    let cancelled = false
    setLoading(true)
    setError(false)

    const apiUrl = getApiUrl()
    fetch(`${apiUrl}/match/player/${ci}/current-week-matches`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return

        // Backend can respond as:
        //   { data: Match[] }  – array of matches
        //   { count: N }       – pre-computed count
        //   Match[]            – bare array
        let count = 0
        if (typeof json?.count === "number") {
          count = json.count
        } else {
          const arr = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : [])
          count = arr.length
        }
        setPlayed(count)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [ci])

  return {
    played,
    remaining: Math.max(0, MAX_MATCHES - played),
    max: MAX_MATCHES,
    loading,
    error,
  }
}
