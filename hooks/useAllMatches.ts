"use client"

import { useState, useEffect, useCallback } from "react"
import type { Match, Inscription, FormattedSet, Tournament } from "@/types"
import { getApiUrl } from "@/lib/api-config"

export interface AllMatchData {
  id: string
  player1Ci: string
  player1Name: string
  player1Avatar: string
  player2Ci: string
  player2Name: string
  player2Avatar: string
  score1: number
  score2: number
  tournamentId: number
  tournamentName: string
  matchDatetime: string
  timeAgo: string
  status: string
  round: string
  sets: FormattedSet[]
  winnerInscriptionId: number | null
  inscription1Id: number
  inscription2Id: number
}

const PAGE_SIZE = 20

function buildTimeAgo(matchDatetime: string): string {
  const matchDate = new Date(matchDatetime)
  const now = new Date()
  const diffMs = now.getTime() - matchDate.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "Hace menos de una hora"
  if (diffHours >= 24) {
    const diffDays = Math.round(diffHours / 24)
    return `${diffDays} día${diffDays !== 1 ? "s" : ""} atrás`
  }
  return `${diffHours} hora${diffHours !== 1 ? "s" : ""} atrás`
}

function formatMatches(
  rawMatches: Match[],
  inscriptions: Inscription[],
  tournamentMap: Map<number, string>
): AllMatchData[] {
  return rawMatches
    .map((match) => {
      const inscription1 = inscriptions.find((i) => i.inscription_id === match.inscription1_id)
      const inscription2 = inscriptions.find((i) => i.inscription_id === match.inscription2_id)
      if (!inscription1 || !inscription2) return null

      const player1Name = `${inscription1.player.first_name} ${inscription1.player.last_name}`
      const player2Name = `${inscription2.player.first_name} ${inscription2.player.last_name}`

      let p1SetsWon = 0
      let p2SetsWon = 0
      const formattedSets: FormattedSet[] = []

      if (match.sets?.length) {
        match.sets.forEach((s) => {
          const p1 = s.score_participant1
          const p2 = s.score_participant2
          if (p1 > p2) p1SetsWon++
          else if (p2 > p1) p2SetsWon++
          formattedSets.push({ p1, p2 })
        })
      }

      // Correct 3×(0-0) sets with a declared winner
      const allZero = formattedSets.length > 0 && formattedSets.every((s) => s.p1 === 0 && s.p2 === 0)
      if (allZero && match.winner_inscription_id !== null) {
        const w = match.winner_inscription_id
        if (formattedSets.length === 3) {
          p1SetsWon = w === match.inscription1_id ? 2 : 1
          p2SetsWon = w === match.inscription2_id ? 2 : 1
        } else {
          p1SetsWon = w === match.inscription1_id ? formattedSets.length : 0
          p2SetsWon = w === match.inscription2_id ? formattedSets.length : 0
        }
      }

      return {
        id: match.match_id.toString(),
        player1Ci: inscription1.player.ci,
        player1Name,
        player1Avatar: (inscription1.player as any).avatar ?? "",
        player2Ci: inscription2.player.ci,
        player2Name,
        player2Avatar: (inscription2.player as any).avatar ?? "",
        score1: p1SetsWon,
        score2: p2SetsWon,
        tournamentId: match.tournament_id,
        tournamentName: tournamentMap.get(match.tournament_id) ?? "Torneo Desconocido",
        matchDatetime: match.match_datetime,
        timeAgo: buildTimeAgo(match.match_datetime),
        status: match.status,
        round: match.round,
        sets: formattedSets,
        winnerInscriptionId: match.winner_inscription_id,
        inscription1Id: match.inscription1_id,
        inscription2Id: match.inscription2_id,
      } satisfies AllMatchData
    })
    .filter((m): m is AllMatchData => m !== null)
}

export function useAllMatches() {
  // All formatted matches (full dataset, loaded once)
  const [allMatches, setAllMatches] = useState<AllMatchData[]>([])
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const apiUrl = getApiUrl()

    async function fetchAllMatches() {
      try {
        setLoading(true)
        const [matchesRes, inscriptionsRes, tournamentsRes] = await Promise.all([
          fetch(`${apiUrl}/match`),
          fetch(`${apiUrl}/inscription`),
          fetch(`${apiUrl}/tournament`),
        ])

        if (!matchesRes.ok || !inscriptionsRes.ok || !tournamentsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [matchesData, inscriptionsData, tournamentsData] = await Promise.all([
          matchesRes.json(),
          inscriptionsRes.json(),
          tournamentsRes.json(),
        ])

        if (cancelled) return

        const rawMatches: Match[] = matchesData.data ?? []
        const inscriptions: Inscription[] = inscriptionsData.data ?? []
        const tournaments: Tournament[] = tournamentsData.data ?? []

        const tournamentMap = new Map<number, string>()
        tournaments.forEach((t) => tournamentMap.set(t.tournament_id, t.name))

        // Sort newest first before slicing
        const sorted = [...rawMatches].sort(
          (a, b) => new Date(b.match_datetime).getTime() - new Date(a.match_datetime).getTime()
        )

        setAllMatches(formatMatches(sorted, inscriptions, tournamentMap))
      } catch (e: any) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAllMatches()
    return () => { cancelled = true }
  }, [])

  /** Expose current visible slice */
  const matches = allMatches.slice(0, displayCount)
  const hasMore = displayCount < allMatches.length
  const total = allMatches.length

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, allMatches.length))
  }, [allMatches.length])

  return { matches, allMatches, loading, error, hasMore, total, loadMore }
}
